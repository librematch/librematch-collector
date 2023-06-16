import {Controller, Get, Request, Response, UseGuards} from '@nestjs/common';
import {createZodDto} from 'nestjs-zod'
import {z} from 'nestjs-zod/z'
import {getPlayerBackgroundColor, parseISONullable, sendResponse} from "../../helper/util";
import {getTranslation} from "../../../../collector/src/helper/translation";
import {getLeaderboardEnumFromId, getLeaderboardIdFromEnum, leaderboards} from "../../helper/leaderboards";
import {PrismaService} from "../../service/prisma.service";
import {getParam, RootObject} from "../legacy.controller";
import {getMapEnumFromId, getMapImage, maps} from 'graph/src/helper/maps';
import {ProfileService} from "../service/profile.service";
import {Prisma} from "@prisma/client";
import {groupBy, sortBy} from "lodash";
import {getCivImage} from "../../helper/civs";
import {ReferenceService} from "../service/reference.service";

class ProfileSingleDto extends createZodDto(z.object({
    profile_id: z.string().regex(/^\d+$/).transform(Number),
})) {
}

const PER_PAGE = 20;


@Controller()
export class MatchesController {

    constructor(
        protected prisma: PrismaService,
        protected referenceService: ReferenceService,
    ) {

    }

    @Get('/api/matches')
    async matches(
        @Request() req,
        @Response() res,
    ) {
        const language = getParam(req.query, 'language') ?? 'en';
        const page = parseInt(getParam(req.query, 'page') ?? '1');
        const profileIds = getParam(req.query, 'profile_ids');
        let search = getParam(req.query, 'search');
        const leaderboardIds = getParam(req.query, 'leaderboard_ids') || 'rm_1v1,rm_team,ew_1v1,ew_team,unranked';

        const profileIdList = profileIds.split(',').map(x => parseInt(x));
        const leaderboardIdList = leaderboardIds.split(',').map(x => getLeaderboardIdFromEnum(x));

        const start = (page - 1) * PER_PAGE + 1;
        const count = PER_PAGE;

        if (search) {
            search = `%${search}%`;
        }

        // console.log('leaderboardIds', leaderboardIds);
        // console.log('leaderboardIdList', leaderboardIdList);

        let matches = await this.prisma.$queryRaw<RootObject[]>`
            SELECT 
             m.*,
             p.*, 
             pr.country,
             pr.name as player_name, 
             CASE WHEN r.rating IS NOT NULL THEN r.rating - COALESCE(r.rating_diff, 0) ELSE lr.rating END as rating,
             r.rating_diff,
             r.games
            FROM match m
            JOIN player p on m.match_id = p.match_id
            JOIN profile pr on p.profile_id = pr.profile_id
            LEFT JOIN rating r on
                m.leaderboard_id = r.leaderboard_id AND
                p.profile_id = r.profile_id AND
                (m.finished > r.date - interval '10 seconds' AND m.finished < r.date + interval '10 seconds')
            LEFT JOIN leaderboard_row lr on
                pr.profile_id = lr.profile_id AND
                m.leaderboard_id = lr.leaderboard_id AND
                (m.finished is null OR m.started > NOW() - INTERVAL '24 HOURS')
            WHERE
                m.match_id IN (
                    SELECT m.match_id FROM match m
                                      WHERE 
                                        m.privacy != 0 AND
                                        m.leaderboard_id IN (${Prisma.join(leaderboardIdList)}) AND
                                        EXISTS (SELECT * FROM player p2 WHERE p2.match_id=m.match_id AND p2.profile_id IN (${Prisma.join(profileIdList)}))
                                      
                                        ${
                                          search ? Prisma.sql`AND EXISTS (SELECT * FROM player p2 JOIN profile pr2 on pr2.profile_id = p2.profile_id WHERE p2.match_id=m.match_id AND pr2.name ILIKE ${search})` : Prisma.empty
                                        }
                                      
                                      ORDER BY m.started desc
                                      OFFSET ${start-1}
                                      LIMIT ${count}
                    )             
            ORDER BY m.started desc
        `;

        const getTeams = (match: any) => {
            let teamIndex = 5;
            return Object.entries(groupBy(match.players, p => {
                if (p.team != -1) return p.team;
                return teamIndex++;
            })).map(([team, players]) => ({team, players}));
        };

        let matches2 = Object.entries(groupBy(matches, x => x.match_id)).map(([matchId, players]) => {
            const match = players[0];

            const teams = getTeams({players});

            return {
                matchId: match.match_id,
                started: match.started,
                finished: match.finished,
                leaderboardId: getLeaderboardEnumFromId(match.leaderboard_id),
                leaderboardName: getTranslation(language, 'leaderboard', match.leaderboard_id),
                name: match.name,
                server: match.server,
                internalLeaderboardId: match.internal_leaderboard_id,
                difficulty: match.difficulty,
                startingAge: match.starting_age,
                fullTechTree: match.full_tech_tree,
                allowCheats: match.allow_cheats,
                empireWarsMode: match.empire_wars_mode,
                endingAge: match.ending_age,
                gameMode: match.game_mode,
                lockSpeed: match.lock_speed,
                lockTeams: match.lock_teams,
                mapSize: match.map_size,
                map: getMapEnumFromId(match.location),
                mapName: getTranslation(language, 'map_type', match.location),
                mapImageUrl: getMapImage(match.location),
                population: match.population,
                recordGame: match.record_game,
                regicideMode: match.regicide_mode,
                gameVariant: match.game_variant,
                resources: match.resources,
                sharedExploration: match.shared_exploration,
                speed: match.speed,
                suddenDeathMode: match.sudden_death_mode,
                teamPositions: match.team_positions,
                teamTogether: match.team_together,
                treatyLength: match.treaty_length,
                turboMode: match.turbo_mode,
                victory: match.victory,
                revealMap: match.reveal_map,
                privacy: match.privacy,
                teams: teams.map(({players}) => players.map(p => ({
                    profileId: p.profile_id,
                    name: p.player_name,
                    rating: p.rating,
                    ratingDiff: p.rating_diff,
                    games: p.games,
                    civ: p.civ,
                    civName: getTranslation(language, 'civ', p.civ),
                    civImageUrl: getCivImage(p.civ),
                    color: p.color,
                    colorHex: getPlayerBackgroundColor(p.color),
                    slot: p.slot,
                    team: p.team,
                    won: p.won,
                    country: p.country,
                    verified: this.referenceService?.referencePlayersDict?.[p.profile_id] != null,
                }))),
            };
        })

        matches2 = sortBy(matches2, m => m.started).reverse();

        const conv = row => {
            return row;
        };

        sendResponse(res, {
            page: page,
            perPage: PER_PAGE,
            matches: matches2.map(conv),
        });
    }
}
