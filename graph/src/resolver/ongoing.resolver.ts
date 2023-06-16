import {Resolver, Subscription} from "@nestjs/graphql";
import {Dummy} from "../object/match";
import {PrismaService} from "../service/prisma.service";
import {CACHE_MANAGER, Inject} from "@nestjs/common";
import {PUB_SUB} from "../modules/redis.module";
import {RedisPubSub} from "graphql-redis-subscriptions";
import {mapIterator} from "../plugin/map.iterator";
import {prefillIterator} from "../plugin/prefill.iterator";
import {Cache} from 'cache-manager';
import {generate, observe} from "fast-json-patch";
import {getLeaderboardEnumFromId} from "../helper/leaderboards";
import {getTranslation} from "../../../collector/src/helper/translation";
import {getMapEnumFromId, getMapImage} from "../helper/maps";
import {getCivImage} from "../helper/civs";
import {getStatusEnumFromId} from "../helper/enums";
import {flatten, meanBy, sumBy} from "lodash";
import {CACHE_LOBBIES, PUBSUB_LOBBIES} from "../../../collector/src/task/lobby.task";
import {CACHE_ONGOING_MATCHES, PUBSUB_ONGOING_MATCHES} from "../../../collector/src/task/ongoing.task";
import {IParsedGenericMatch} from "../../../collector/src/parser/match";
import {getPlayerBackgroundColor} from "../helper/util";


function getTotalSlotCount(match: any) {
    return 8 - match.players.filter((p: any) => getStatusEnumFromId(p.status) == 'closed').length;
}

function getBlockedSlotCount(match: any) {
    return match.players.filter((p: any) => {
        return getStatusEnumFromId(p.status) == 'ai' ||
            (getStatusEnumFromId(p.status) == 'player' && p.profile_id > 0);
    }).length;
}

function getLobbyPlayerName(p: any) {
    if (getStatusEnumFromId(p.status) == 'player') {
        return p.profile_id > 0 ? null : 'Open';
    }
    return getTranslation('en', 'status', p.status);
}


@Resolver()
export class OngoingResolver {

    constructor(
        private prisma: PrismaService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) {}

    async reviveOngoingMatches(matches: any) {
        // console.log('reviveLobby', match);

        const language = 'en';

        const profiles = await this.prisma.profile.findMany({
            include: {
                leaderboard_row: true,
            },
            where: {
                profile_id: { in: flatten(matches.map(a => a.players.map(p => p.profile_id))) },
            },
        });

        const conv = (match: IParsedGenericMatch) => {
            const players = match.players.map((p: any) => {
                const profile = profiles.find(profile => profile.profile_id === p.profile_id);
                return ({
                    ...p,
                    rating: profile?.leaderboard_row?.find(l => l.leaderboard_id === match.leaderboard_id)?.rating,
                    civName: p.civ ? getTranslation(language, 'civ', p.civ) : null,
                    civImageUrl: p.civ ? getCivImage(p.civ) : null,
                    color: p.color,
                    colorHex: getPlayerBackgroundColor(p.color),
                    status: getStatusEnumFromId(p.status),
                    name: getLobbyPlayerName(p) || profile?.name,
                    games: sumBy(profile.leaderboard_row, l => l.wins + l.losses),
                    wins: sumBy(profile.leaderboard_row, l => l.wins),
                    losses: sumBy(profile.leaderboard_row, l => l.losses),
                    drops: sumBy(profile.leaderboard_row, l => l.drops),
                    country: profile?.country,
                });
            });
            return {
                ...match,
                leaderboardId: getLeaderboardEnumFromId(match.leaderboard_id),
                leaderboardName: getTranslation(language, 'leaderboard', match.leaderboard_id),
                map: getMapEnumFromId(match.location),
                mapName: getTranslation(language, 'map_type', match.location),
                mapImageUrl: getMapImage(match.location),
                averageRating: meanBy(players.filter((p: any) => p.rating), (p: any) => p.rating),
                gameMode: getMapEnumFromId(match.game_mode),
                gameModeName: getTranslation(language, 'game_type', match.game_mode),
                totalSlotCount: getTotalSlotCount(match),
                blockedSlotCount: getBlockedSlotCount(match),
                players,
            }
        };

        matches = matches.map(conv);

        return matches;
    }

    @Subscription(returns => String, { resolve: x => x })
    async ongoingMatchesUpdatedSub() {
        console.log('ongoingMatchesUpdatedSub');

        const base = {};

        const observer = observe(base);
        const lobbies = await this.cache.get(CACHE_ONGOING_MATCHES) as any[] || [];

        const matches = await this.reviveOngoingMatches(lobbies);

        const existingKeys = Object.keys(base);
        for (const existingKey of existingKeys) {
            delete base[existingKey];
        }
        for (const match of matches) {
            base[match.match_id] = match;
        }

        const patch = JSON.stringify(generate(observer));

        // console.log('patch', patch);

        return prefillIterator(
            mapIterator(
                this.pubSub.asyncIterator(PUBSUB_ONGOING_MATCHES),
                async (lobbies: any) => {
                    const matches = await this.reviveOngoingMatches(lobbies);

                    const existingKeys = Object.keys(base);
                    for (const existingKey of existingKeys) {
                        delete base[existingKey];
                    }
                    for (const match of matches) {
                        base[match.match_id] = match;
                    }
                    const patch = JSON.stringify(generate(observer));

                    // console.log(JSON.stringify(base).length);
                    // console.log(patch.length);

                    return patch;
                }
            ),
            [patch],
        );
    }
}
