// SPDX-License-Identifier: AGPL-3.0-or-later

import { CACHE_MANAGER, Controller, Get, Inject, OnModuleInit, Req, Request, Response, UseGuards } from '@nestjs/common';
import { PrismaService } from "../service/prisma.service";
import { fromUnixTime, getUnixTime } from "date-fns";
import { getTranslation } from "../../../collector/src/helper/translation";
import { getColor } from "../../../collector/src/helper/colors";
import { getFlag } from "../../../collector/src/helper/flags";
import { groupBy, sortBy } from "lodash";
import { Prisma } from "@prisma/client";
import { parseISONullable, sendResponse, sendResponseJsonRaw } from "../helper/util";
import { Cache } from "cache-manager";
import {
    fixCivMappingDawnOfTheDukes,
    fixCivMappingDynastiesOfIndia,
    fixCivMappingLordsOfTheWest,
    fixCivMappingReturnOfRome
} from "../helper/civ-fix";

// https://web.archive.org/web/20220901140208/https://aoe2.net/#api

interface IRow {
    key: string;
    count: string;
}

export interface RootObject {
    match_id: number;
    name: string;
    player_name: string;
    server: string;
    started: Date;
    finished: string;
    allow_cheats: boolean;
    difficulty: number;
    empire_wars_mode: boolean;
    ending_age: number;
    full_tech_tree: boolean;
    game_mode: number;
    location: number;
    lock_speed: boolean;
    lock_teams: boolean;
    map_size: number;
    population: number;
    record_game: boolean;
    regicide_mode: boolean;
    game_variant: number;
    resources: number;
    reveal_map: number;
    shared_exploration: boolean;
    speed: number;
    starting_age: number;
    sudden_death_mode: boolean;
    team_positions: boolean;
    team_together: boolean;
    treaty_length: number;
    turbo_mode: boolean;
    victory: number;
    internal_leaderboard_id: number;
    leaderboard_id: number;
    privacy: number;
    profile_id: number;
    civ: number;
    slot: number;
    team: number;
    color: number;
    is_ready: number;
    status: number;
    won: boolean;
    rating: number;
    rating_diff?: number;
    games: number;
}


export function getParam(params: { [name: string]: any } | null, key: string): string {
    if (params == null) {
        return null;
    }
    return params[key];
}

const convPlayer = row => {
    row.name = row.profile.name;
    row.civ_alpha = row.civ;
    row.slot_type = 1;
    delete row.profile;
    return row;
};

const convMatch = row => {
    row.started = row.started ? getUnixTime(row.started) : null;
    row.finished = row.finished ? getUnixTime(row.finished) : null;
    row.players = row.players.map(convPlayer);
    row.num_players = row.players.length;
    row.map_type = row.location;
    if (row.leaderboard_id == null) {
        row.leaderboard_id = 0;
    }
    return row;
};


const convPlayer2 = row => {
    row.civ_alpha = row.civ;
    row.slot_type = 1;
    return row;
};

const convMatch2 = row => {
    row.started = row.started ? getUnixTime(row.started) : null;
    row.finished = row.finished ? getUnixTime(row.finished) : null;
    row.players = row.players.map(convPlayer2);
    row.num_players = row.players.length;
    row.map_type = row.location;
    if (row.leaderboard_id == null) {
        row.leaderboard_id = 0;
    }
    return row;
};

const CACHE_LEADERBOARD_COUNT = 'leaderboard-count-${leaderboardId}';


const publicMatchCondition = {
    OR: [
        { privacy: { equals: null } },
        { privacy: { not: 0 } },
    ]
};

@Controller()
export class LegacyController implements OnModuleInit {

    constructor(
        protected prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) {

    }

    async onModuleInit() {

    }

    @Get('/ready')
    async ready(@Req() req, @Response() res) {
        sendResponse(res, 'Ready.');
    }

    @Get('/kv/get')
    async kvGet(@Req() req, @Response() res) {
        const key = getParam(req.query, 'key');
        const value = await this.cache.get(key);
        sendResponseJsonRaw(res, value);
    }

    @Get('/api/write')
    async write(
        @Request() req,
        @Response() res,
    ) {
        console.log(req.query.name);
        console.log(req.query.value);
        sendResponse(res, {
            done: true
        });
    }

    /*

    Endpoint
      /api/match
    Request Parameters
      - match_id (required)
        Match ID
    Example Request
      https://aoe2.net/api/match?uuid=66ec2575-5ee4-d241-a1fc-d7ffeffb48b6

     */

    @Get('/api/match')
    async match(
        @Request() req,
        @Response() res,
    ) {
        const matchId = getParam(req.query, 'match_id');

        if (
            matchId == null
        ) {
            sendResponse(res, {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid or missing params',
                }, null, 2),
            });
            return;
        }

        const match = await this.prisma.match.findUnique({
            include: {
                players: true,
            },
            where: {
                match_id: parseInt(matchId),
            },
        });

        sendResponse(res, match);
    }

    /*

    Endpoint
      /api/matches
    Request Parameters
      - count (Required)
        Number of matches to get (Must be 1000 or less))
      - since (Optional)
        Only show matches starting equal or after timestamp (epoch)
    Example Request
      https://aoe2.net/api/matches?game=aoe2de&count;=10&since;=1596775000

     */

    @Get('/api/matches')
    async matches(
        @Request() req,
        @Response() res,
    ) {
        const count = parseInt(getParam(req.query, 'count') ?? '10');
        const since = parseInt(getParam(req.query, 'since'));

        const matches = await this.prisma.match.findMany({
            include: {
                players: {
                    include: {
                        profile: true,
                    },
                },
            },
            where: {
                ...(since && { started: { gte: fromUnixTime(since) } }),
            },
            take: count,
            orderBy: {
                started: 'asc',
            },
        });

        sendResponse(res, matches.map(convMatch));
    }

    /*

    Endpoint
      /api/leaderboard
    Request Parameters
      - leaderboard_id (Required)
        Leaderboard ID (Unranked=0, 1v1 Deathmatch=1, Team Deathmatch=2, 1v1 Random Map=3, Team Random Map=4, 1v1 Empire Wars=13, Team Empire Wars=14)
      - start (Required)
        Starting rank (Ignored if search, steam_id, or profile_id are defined)
      - count (Required)
        Number of leaderboard entries to get (Must be 10000 or less))
      - search (Optional)
        Name Search
      - profile_id (Optional)
        Profile ID (ex: 459658)
    Example Request
      https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard;_id=3&start;=1&count;=1

     */

    @Get('/api/leaderboard')
    async leaderboard(
        @Request() req,
        @Response() res,
    ) {
        const start = parseInt(getParam(req.query, 'start') ?? '1');
        const count = parseInt(getParam(req.query, 'count') ?? '10');
        const leaderboardId = parseInt(getParam(req.query, 'leaderboard_id'));
        let country = getParam(req.query, 'country') || null;
        const steamId = getParam(req.query, 'steam_id') || null;
        const profileId = parseInt(getParam(req.query, 'profile_id')) || null;
        const search = getParam(req.query, 'search') || null;

        if (country) {
            country = country.toLowerCase();
        }

        const conv = row => {
            row.last_match = getUnixTime(row.last_match_time);
            row.games = row.wins + row.losses;
            row.country = row.profile.country?.toUpperCase();
            delete row.profile;
            return row;
        };

        if (profileId) {
            const leaderboardRow = await this.prisma.leaderboard_row.findUnique({
                include: {
                    profile: true,
                },
                where: {
                    leaderboard_id_profile_id: {
                        leaderboard_id: leaderboardId,
                        profile_id: profileId,
                    },
                },
            });
            if (leaderboardRow == null) {
                return sendResponse(res, {
                    leaderboard_id: leaderboardId,
                    leaderboard: [],
                });
            }
            return sendResponse(res, {
                leaderboard_id: leaderboardId,
                leaderboard: [
                    conv(leaderboardRow),
                ],
            });
        }

        const leaderboardRows = await this.prisma.leaderboard_row.findMany({
            include: {
                profile: true,
            },
            where: {
                leaderboard_id: leaderboardId,
                ...(country && { profile: { country } }),
                ...(search && { name: { contains: search, mode: "insensitive" } }),
            },
            skip: start - 1,
            take: count,
            orderBy: {
                ['rank']: 'asc',
            },
        });

        // console.log(leaderboardRows);

        if (country) {
            leaderboardRows.forEach(row => row.rank = row.rank_country);
        }

        const cacheKey = CACHE_LEADERBOARD_COUNT.replace('${leaderboardId}', leaderboardId.toString());
        const cache = await this.cache.get(cacheKey) || {};
        const total = cache[country || 'world'] || 0;

        sendResponse(res, {
            leaderboard_id: leaderboardId,
            total: total,
            start: start,
            count: count,
            country: country,
            leaderboard: leaderboardRows.map(conv),
        });
    }

    @Get('/api/player/ratinghistory')
    async playerRatinghistory(
        @Request() req,
        @Response() res,
    ) {
        const leaderboardId = parseInt(getParam(req.query, 'leaderboard_id'));
        const profileId = parseInt(getParam(req.query, 'profile_id')) || null;

        // console.log('ratinghistory', leaderboardId, profileId);

        let historyEntries = await this.prisma.rating.findMany({
            select: {
                rating: true,
                date: true,
            },
            where: {
                profile_id: profileId,
                leaderboard_id: leaderboardId,
            },
            orderBy: {
                date: 'desc',
            },
        });

        const conv = row => {
            row.timestamp = getUnixTime(row.date);
            return row;
        };

        // console.log('ratinghistory', historyEntries.length);

        sendResponse(res, historyEntries.map(conv));
    }

    @Get('/api/profile')
    async profile(
        @Request() req,
        @Response() res,
    ) {
        const start = parseInt(getParam(req.query, 'start') ?? '1');
        const count = parseInt(getParam(req.query, 'count') ?? '10');
        const steamId = getParam(req.query, 'steam_id') || null;
        const profileId = parseInt(getParam(req.query, 'profile_id')) || null;
        let search = getParam(req.query, 'search') || null;

        if (search) {
            search = `%${search}%`;
        }

        let profiles = [];
        if (search != null) {
            profiles = await this.prisma.$queryRaw`
                SELECT p.profile_id, p.name, country, SUM(wins+losses) as games
                FROM profile as p
                LEFT JOIN leaderboard_row lr on p.profile_id = lr.profile_id
                WHERE p.name ILIKE ${search}
                GROUP BY p.profile_id
                ORDER BY SUM(wins+losses) desc NULLS LAST
                OFFSET ${start - 1}
                LIMIT ${count}
            `;
        } else if (profileId != null) {
            profiles = await this.prisma.$queryRaw`
                SELECT p.profile_id, p.name, country, SUM(wins+losses) as games
                FROM profile as p
                LEFT JOIN leaderboard_row lr on p.profile_id = lr.profile_id
                WHERE p.profile_id = ${profileId}
                GROUP BY p.profile_id
                ORDER BY SUM(wins+losses) desc NULLS LAST
                OFFSET ${start - 1}
                LIMIT ${count}
            `;
        } else if (steamId != null) {
            profiles = await this.prisma.$queryRaw`
                SELECT p.profile_id, p.name, country, SUM(wins+losses) as games
                FROM profile as p
                LEFT JOIN leaderboard_row lr on p.profile_id = lr.profile_id
                WHERE p.steam_id = ${steamId}
                GROUP BY p.profile_id
                ORDER BY SUM(wins+losses) desc NULLS LAST
                OFFSET ${start - 1}
                LIMIT ${count}
            `;
        }

        sendResponse(res, {
            start: start,
            count: count,
            profiles,
        });
    }

    /*

    Endpoint
        /api/player/matches
    Request Parameters
      - start (Required)
        Starting match (0 is the most recent match)
      - count (Required)
        Number of matches to get (Must be 1000 or less))
      - profile_id (steam_id or profile_id required)
        Profile ID (ex: 459658)
      - profile_ids (steam_id or profile_id required)
        Profile ID (ex: 459658,199325)
    Example Request
        https://aoe2.net/api/player/matches?game=aoe2de&steam;_id=76561199003184910&count;=5

     */
    @Get('/api/player/matches2')
    async playerMatches2(
        @Request() req,
        @Response() res,
    ) {
        const start = parseInt(getParam(req.query, 'start') ?? '1');
        const count = parseInt(getParam(req.query, 'count') ?? '10');
        const profileIds = getParam(req.query, 'profile_ids');

        const matches = await this.prisma.match.findMany({
            where: {
                players: {
                    some: {
                        profile_id: { in: profileIds.split(',').map(x => parseInt(x)) },
                    },
                },
                ...publicMatchCondition,
            },
            include: {
                players: {
                    include: {
                        profile: true,
                    },
                },
            },
            take: count,
            orderBy: {
                started: 'desc',
            },
        });

        // console.log(leaderboardRows);

        sendResponse(res, matches.map(convMatch));
    }

    @Get('/api/player/matches')
    async playerMatches(
        @Request() req,
        @Response() res,
    ) {
        const start = parseInt(getParam(req.query, 'start') ?? '0') + 1; // old implementation detail
        const count = parseInt(getParam(req.query, 'count') ?? '10');
        const profileIds = getParam(req.query, 'profile_ids');
        let search = getParam(req.query, 'search');

        const profileIdList = profileIds.split(',').map(x => parseInt(x));

        if (search) {
            search = `%${search}%`;
        }

        let matches = await this.prisma.$queryRaw<RootObject[]>`
            SELECT 
             m.*,
             p.*, 
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
                                        EXISTS (SELECT * FROM player p2 WHERE p2.match_id=m.match_id AND p2.profile_id IN (${Prisma.join(profileIdList)}))
                                      
                                        ${search ? Prisma.sql`AND EXISTS (SELECT * FROM player p2 JOIN profile pr2 on pr2.profile_id = p2.profile_id WHERE p2.match_id=m.match_id AND pr2.name ILIKE ${search})` : Prisma.empty
            }
                                      
                                      ORDER BY m.started desc
                                      OFFSET ${start - 1}
                                      LIMIT ${count}
                    )
            ORDER BY m.started desc
        `;

        let matches2 = Object.entries(groupBy(matches, x => x.match_id)).map(([matchId, players]) => {
            const match = players[0];
            return {
                match_id: match.match_id,
                started: match.started,
                finished: match.finished,
                leaderboard_id: match.leaderboard_id,
                name: match.name,
                server: match.server,
                internal_leaderboard_id: match.internal_leaderboard_id,
                difficulty: match.difficulty,
                starting_age: match.starting_age,
                full_tech_tree: match.full_tech_tree,
                allow_cheats: match.allow_cheats,
                empire_wars_mode: match.empire_wars_mode,
                ending_age: match.ending_age,
                game_mode: match.game_mode,
                lock_speed: match.lock_speed,
                lock_teams: match.lock_teams,
                map_size: match.map_size,
                location: match.location,
                population: match.population,
                record_game: match.record_game,
                regicide_mode: match.regicide_mode,
                game_variant: match.game_variant,
                resources: match.resources,
                shared_exploration: match.shared_exploration,
                speed: match.speed,
                sudden_death_mode: match.sudden_death_mode,
                team_positions: match.team_positions,
                team_together: match.team_together,
                treaty_length: match.treaty_length,
                turbo_mode: match.turbo_mode,
                victory: match.victory,
                reveal_map: match.reveal_map,
                privacy: match.privacy,
                players: players.map(p => ({
                    profile_id: p.profile_id,
                    name: p.player_name,
                    rating: p.rating,
                    rating_diff: p.rating_diff,
                    games: p.games,
                    civ: p.civ,
                    color: p.color,
                    slot: p.slot,
                    team: p.team,
                    won: p.won,
                })),
            };
        })

        matches2 = sortBy(matches2, m => m.started).reverse();

        // HACK: Fix new civ order for DLCs

        const releaseDateLordsOfTheWest = 1611680400; // 26.01.2021 @ 5:00pm (UTC)
        const releaseDateDawnOfTheDukes = 1628611200; // 10.08.2021 @ 5:00pm (UTC)
        const releaseDateDynastiesOfIndia = 1651158000; // 28.04.2022 @ 5:00pm (UTC)
        const releaseDateReturnOfRome = 1684249200; // 16.05.2023 @ 5:00pm (UTC)

        matches2.forEach(match => {
            if (match.game_variant == 1) {
                // console.log(match.match_id, 'AOE RoR');
                match.players.forEach(player => {
                    // console.log(player.name, player.civ, '=>', fixCivMappingReturnOfRome[player.civ]);
                    player.civ = 10000 + fixCivMappingReturnOfRome[player.civ];
                });
            } else if (match.game_variant == null || match.game_variant == 2) {
                if (getUnixTime(match.started) > releaseDateReturnOfRome) {
                    // console.log(match.match_id, 'AOE DE - Return of Rome');
                    match.players.forEach(player => {
                        // console.log(player.name, player.civ, '=>', fixCivMappingReturnOfRome[player.civ]);
                        player.civ = fixCivMappingReturnOfRome[player.civ];
                    });
                } else if (getUnixTime(match.started) > releaseDateDynastiesOfIndia) {
                    // console.log(match.match_id, 'AOE DE - Dynasties of India');
                    match.players.forEach(player => {
                        // console.log(player.name, player.civ, '=>', fixCivMappingDynastiesOfIndia[player.civ]);
                        player.civ = fixCivMappingDynastiesOfIndia[player.civ];
                    });
                } else if (getUnixTime(match.started) > releaseDateDawnOfTheDukes) {
                    // console.log(match.match_id, 'AOE DE - Dawn of the Dukes');
                    match.players.forEach(player => {
                        // console.log(player.name, player.civ, '=>', fixCivMappingDawnOfTheDukes[player.civ]);
                        player.civ = fixCivMappingDawnOfTheDukes[player.civ];
                    });
                } else if (getUnixTime(match.started) > releaseDateLordsOfTheWest) {
                    // console.log(match.match_id, 'AOE DE - Lords of the West');
                    match.players.forEach(player => {
                        // console.log(player.name, player.civ, '=>', fixCivMappingLordsOfTheWest[player.civ]);
                        player.civ = fixCivMappingLordsOfTheWest[player.civ];
                    });
                }
            }
        });

        console.log(matches2[0].started);
        console.log(getUnixTime(matches2[0].started));

        sendResponse(res, matches2.map(convMatch2));
    }


    // fixMatchCivsInPlace(matches: any[]) {
    //
    //     // HACK: Fix new civ order after Lords of the West
    //     const releaseDateLoW = 1611680400; // 26.01.2021 @ 5:00pm (UTC)
    //     matches.filter(match => getUnixTime(match.started) < releaseDateLoW).forEach(match => {
    //         match.players.forEach(player => {
    //             if (player.civ >= 4) player.civ++;
    //             if (player.civ >= 29) player.civ++;
    //         })
    //     });
    //
    //     // HACK: Fix new civ order after Dawn of the Dukes
    //     const releaseDateDoD = 1628611200; // 10.08.2021 @ 5:00pm (UTC)
    //     matches.filter(match => getUnixTime(match.started) < releaseDateDoD).forEach(match => {
    //         match.players.forEach(player => {
    //             if (player.civ >= 2) player.civ++;
    //             if (player.civ >= 28) player.civ++;
    //         })
    //     });
    //
    //     // HACK: Fix new civ order after Dynasties of India
    //     const releaseDateDoI = 1651158000; // 28.04.2022 @ 5:00pm (UTC)
    //     matches.filter(match => getUnixTime(match.started) < releaseDateDoI).forEach(match => {
    //         match.players.forEach(player => {
    //             if (player.civ >= 1) player.civ++;
    //             if (player.civ >= 12) player.civ++;
    //             if (player.civ >= 16) player.civ++;
    //             if (player.civ == 19) player.civ = 42;
    //         })
    //     });
    //
    // }


    /*

    Rank
      Request rank details about a player

    Request Parameters
      - leaderboard_id (Optional, defaults to 3)
        Leaderboard ID (Unranked=0, 1v1 Deathmatch=1, Team Deathmatch=2, 1v1 Random Map=3, Team Random Map=4, 1v1 Empire Wars=13, Team Empire Wars=14)
      - flag (Optional, defaults to true)
        Show player flag
      - search (search, steam_id or profile_id required)
        Name Search, returns the highest rated player
      - steam_id (search, steam_id or profile_id required)
        steamID64 (ex: 76561199003184910)
      - profile_id (search, steam_id or profile_id required)
        Profile ID (ex: 459658)
    Example Command
        !addcom !rank $(urlfetch https://legacy.aoe2companion.com/api/nightbot/rank?leaderboard_id=3&search=$(querystring)&steam_id=76561199003184910&flag=false)
    Example Responses
        twitchuser: !rank
        Nightbot: Hoang (1799) Rank #44, has played 1181 games with a 59% winrate, -1 streak, and 20 drops
        twitchuser: !rank Hera
        Nightbot: Hera (2118) Rank #1, has played 659 games with a 71% winrate, +6 streak, and 3 drops

    //  language (Optional, defaults to en) - not fully translated
    //  Language (en, de, fr, es, es-mx, it, ms, pt, pl, ko, ru, tr, vi, hi, ja, zh-hans, zh-hant)

     */
    @Get('/api/nightbot/rank')
    async nightbotRank(
        @Request() req,
        @Response() res,
    ) {
        const leaderboardId = parseInt(getParam(req.query, 'leaderboard_id') ?? '3');
        const language = 'en'; //getParam(req.query, 'language') ?? 'en';
        const flag = (getParam(req.query, 'flag') ?? 'true') === 'true';
        const search = getParam(req.query, 'search') || null;
        const steamId = getParam(req.query, 'steam_id') || null;
        const profileId = parseInt(getParam(req.query, 'profile_id')) || null;

        if (search == null && steamId == null && profileId == null) {
            return sendResponse(res, 'Missing search, steam_id, or profile_id');
        }

        const leaderboardRow = await this.getPlayer(leaderboardId, search, steamId, profileId);

        if (leaderboardRow == null) {
            return sendResponse(res, 'Player not found');
        }

        // Hera (2118) Rank #1, has played 659 games with a 71% winrate, +6 streak, and 3 drops

        const name = leaderboardRow.profile.name;
        const rating = leaderboardRow.rating;
        const rank = leaderboardRow.rank;
        const games = leaderboardRow.wins + leaderboardRow.losses;
        const winrate = (leaderboardRow.wins / games * 100).toFixed(0);
        const streak = leaderboardRow.streak;
        const drops = leaderboardRow.drops;

        const _flag = flag ? getFlag(leaderboardRow.profile.country) + ' ' : '';

        return sendResponse(res, `${_flag} ${name} (${rating}) Rank #${rank}, has played ${games} games with a ${winrate}% winrate, ${streak} streak, and ${drops} drops`);
    }

    async getPlayer(leaderboardId: number, search: string, steamId: string, profileId: number) {
        if (search != null) {
            return await this.prisma.leaderboard_row.findFirst({
                include: {
                    profile: true,
                },
                where: {
                    leaderboard_id: leaderboardId,
                    name: { contains: search, mode: "insensitive" }
                },
                orderBy: {
                    rating: 'desc',
                }
            });
        } else if (profileId != null) {
            return await this.prisma.leaderboard_row.findFirst({
                include: {
                    profile: true,
                },
                where: {
                    leaderboard_id: leaderboardId,
                    profile: {
                        profile_id: profileId,
                    },
                },
            });
        } else if (steamId != null) {
            return await this.prisma.leaderboard_row.findFirst({
                include: {
                    profile: true,
                },
                where: {
                    leaderboard_id: leaderboardId,
                    profile: {
                        steam_id: steamId,
                    },
                },
            });
        }
    }

    async getProfile(search: string, steamId: string, profileId: number) {
        if (search != null) {
            return await this.prisma.profile.findFirst({
                where: {
                    name: { contains: search, mode: "insensitive" }
                },
            });
        } else if (profileId != null) {
            return await this.prisma.profile.findFirst({
                where: {
                    profile_id: profileId,
                },
            });
        } else if (steamId != null) {
            return await this.prisma.profile.findFirst({
                where: {
                    steam_id: steamId,
                },
            });
        }
    }

    /*

    Match
    Request details about the current or last match

    Request Parameters
      - leaderboard_id (Optional, defaults to 3)
        Leaderboard ID is used when search is defined, will find the highest rated player matching the search term (Unranked=0, 1v1 Deathmatch=1, Team Deathmatch=2, 1v1 Random Map=3, Team Random Map=4, 1v1 Empire Wars=13, Team Empire Wars=14)
     -  color (Optional, defaults to true)
        Show player colors
      - search (search, steam_id or profile_id required)
        Name Search, returns the highest rated player
      - steam_id (steam_id or profile_id required)
        steamID64 (ex: 76561199003184910)
      - profile_id (steam_id or profile_id required)
        Profile ID (ex: 459658)
    Example Command
        !addcom !match $(urlfetch https://legacy.aoe2companion.com/api/nightbot/match?search=$(querystring)&steam_id=76561199003184910&color=false&flag=false)
    Example Responses
        twitchuser: !match
        Nightbot: Hoang (1815) as Celts -VS- DracKeN (1820) as Celts playing on Black Forest
        twitchuser: !match Hera
        Nightbot: Hera (2112) as Mayans -VS- ACCM (1960) as Aztecs playing on Gold Rush

    //  language (Optional, defaults to en) - not fully translated
    //  Language (en, de, fr, es, es-mx, it, ms, pt, pl, ko, ru, tr, vi, hi, ja, zh-hans, zh-hant)

    //  flag (Optional, defaults to false)
    //  Show player flag

     */
    @Get('/api/nightbot/match')
    async nightbotMatch(
        @Request() req,
        @Response() res,
    ) {
        const leaderboardIdParam = getParam(req.query, 'leaderboard_id');
        const leaderboardId = leaderboardIdParam ? parseInt(leaderboardIdParam) : null;
        const language = 'en'; //getParam(req.query, 'language') ?? 'en';
        const color = (getParam(req.query, 'color') ?? 'true') === 'true';
        const flag = false; //(getParam(req.query, 'flag') ?? 'true') === 'true';
        const search = getParam(req.query, 'search') || null;
        const steamId = getParam(req.query, 'steam_id') || null;
        const profileId = parseInt(getParam(req.query, 'profile_id')) || null;

        if (search == null && steamId == null && profileId == null) {
            return sendResponse(res, 'Missing search, steam_id, or profile_id');
        }

        let playerProfileId = null;

        if (leaderboardId != null) {
            const leaderboardRow = await this.getPlayer(leaderboardId, search, steamId, profileId);
            playerProfileId = leaderboardRow?.profile_id;
        } else {
            const profile = await this.getProfile(search, steamId, profileId);
            playerProfileId = profile?.profile_id;
        }

        if (playerProfileId == null) {
            return sendResponse(res, 'Player for match not found');
        }

        const match = await this.prisma.match.findFirst({
            where: {
                players: {
                    some: {
                        profile_id: playerProfileId,
                    },
                },
                ...publicMatchCondition,
            },
            include: {
                players: {
                    include: {
                        profile: true,
                    },
                },
            },
            orderBy: {
                started: 'desc',
            },
        });

        if (match == null) {
            return sendResponse(res, 'Match not found');
        }

        // console.log(match);

        const leaderboardRows = await this.prisma.leaderboard_row.findMany({
            include: {
                profile: true,
            },
            where: {
                leaderboard_id: match.leaderboard_id,
                profile: {
                    profile_id: { in: match.players.map(p => p.profile_id) },
                },
            },
        });

        // Nightbot: Hera (2112) as Mayans -VS- ACCM (1960) as Aztecs playing on Gold Rush

        const getTeams = (match: any) => {
            let teamIndex = 5;
            return Object.entries(groupBy(match.players, p => {
                if (p.team != -1) return p.team;
                return teamIndex++;
            })).map(([team, players]) => ({ team, players }));
        };

        const formatPlayer = (player: any) => {
            const name = player.profile.name;
            const civ = getTranslation(language, 'civ', player.civ);
            const rating = leaderboardRows.find(r => r.profile_id === player.profile_id)?.rating ?? '-';

            const _color = color ? ' ' + getColor(player.color) : '';
            const _flag = flag ? ' ' + getFlag(player.profile.country) : '';

            return `${_color} ${_flag} ${name} (${rating}) as ${civ}`;
        };

        const formatTeam = (team: any) => {
            return team.players.map(formatPlayer).join(' + ');
        };

        const teams = getTeams(match);
        const players = teams.map(formatTeam).join(' vs ');

        const map = getTranslation(language, 'map_type', match.location);

        return sendResponse(res, `${players} playing on ${map}`);
    }

    // @Get('/api/match')
    // async matches(
    //     @Request() req,
    //     @Response() res,
    // ) {
    //     time(1);
    //     console.log('params:', req.query);
    //
    //     const matchId = getParam(req.query, 'match_id');
    //
    //     console.log({
    //         matchId,
    //     });
    //
    //     if (
    //         matchId == null
    //     ) {
    //         sendResponse(res, {
    //             statusCode: 400,
    //             body: JSON.stringify({
    //                 message: 'Invalid or missing params',
    //             }, null, 2),
    //         });
    //         return;
    //     }
    //
    //     time();
    //
    //     const matches = await this.prisma.match.findMany({
    //         include: {
    //             players: true,
    //         },
    //         where: {
    //             match_id: parseInt(matchId),
    //         },
    //         take: count,
    //         orderBy: {
    //             match_id: 'asc',
    //         },
    //     });
    //     time();
    //
    //     sendResponse(res, {
    //         next_cursor: matches.length < count ? null : matches[matches.length - 1].match_id,
    //         matches,
    //     });
    //     time();
    // }
}
