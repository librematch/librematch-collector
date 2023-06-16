import {Inject, Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {PrismaService} from '../service/prisma.service';
import {Prisma} from '@prisma/client'
import {chunk, maxBy, uniq, uniqBy} from "lodash";
import {upsertMany} from "../helper/db";
import {getRecentMatchHistory} from "../helper/api";
import {parseRecentMatch, recentMatchToGenericMatch} from "../parser/relic/recent-match";
import {isEqual} from "date-fns";
import {PUB_SUB} from "../../../graph/src/modules/redis.module";
import {RedisPubSub} from "graphql-redis-subscriptions";
import {time} from "../parser/util";
import {sleep} from "../helper/util";
import {sendMetric} from "../helper/metric-api";
import {InjectSentry, SentryService} from "@ntegral/nestjs-sentry";
import {MATCH_PARSER_VERSION} from "../parser/match";
import {PUBSUB_MATCH_STARTED} from "./ongoing.task";

export const PUBSUB_MATCH_FINISHED = 'pubsub-match-finished';

@Injectable()
export class MatchTask implements OnApplicationBootstrap {
    private readonly logger = new Logger(MatchTask.name);

    metricMatchesImported = 0;

    constructor(
        private prisma: PrismaService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
        @InjectSentry() private readonly sentryService: SentryService,
    ) {}

    async onApplicationBootstrap() {
        setTimeout(() => this.importMatches(), 500);
        setInterval(() => this.sendMetrics(), 60 * 1000);
    }

    async sendMetrics() {
        sendMetric(`matches_imported`, this.metricMatchesImported);
        this.metricMatchesImported = 0;
    }

    async importMatches() {
        try {
            await this.fetchPendingMatches();
            console.log(new Date(), 'Waiting 1s');
            setTimeout(() => this.importMatches(), 1000);
        } catch (e) {
            console.error(e);
            this.sentryService.instance().captureException(e);
            console.log(new Date(), 'Restart importer in 60s');
            setTimeout(() => this.importMatches(), 60 * 1000);
        }
    }

    async fetchPendingMatches() {
        console.log();
        console.log('FetchPendingMatches');

        const pendingMatches = await this.prisma.match_pending.findMany({
           take: 100,
           orderBy: {
               priority: 'desc',
           },
        });


        console.log(`Got ${pendingMatches.length} pending matches`);

        for (const pendingMatchChunk of chunk(pendingMatches, 10)) {
            const profileIds = pendingMatchChunk.map(p => p.profile_id);
            let [num, matches] = await getRecentMatchHistory(profileIds);
            console.log(profileIds);

            // api might return double matches
            matches = uniqBy(matches, match => match[0]);

            const parsed = [];

            let matchItems: Prisma.matchCreateManyInput[] = [];
            let playerItems: Prisma.playerCreateManyInput[] = [];
            let matchRawItems: Prisma.match_rawCreateManyInput[] = [];

            time('parseRecentMatch');
            for (const match of matches) {
                try {
                    const parsedData = parseRecentMatch(match);
                    parsed.push(parsedData);

                    if (parsedData.finished == null) {
                        console.log(`pending match not FINISHED match id ${parsedData.match_id}`);
                    }

                    const {players, ...matchData} = parsedData;

                    matchItems.push({
                        ...matchData,
                    });

                    matchRawItems.push({
                        match_id: parsedData.match_id,
                        json: JSON.stringify(match),
                    });

                    players.forEach(parsedPlayerData => {
                        playerItems.push({
                            ...parsedPlayerData,
                        });
                    });
                } catch (e) {
                    matchRawItems.push({
                        match_id: match[0],
                        json: JSON.stringify(match),
                        error: true,
                        version: MATCH_PARSER_VERSION,
                    });

                    console.log('ERROR PARSING RECENT MATCH', match[0], e.message);
                    // this.sentryService.instance().captureException(e);
                }
            }

            console.log('matchItems.length', matchItems.length);

            time();

            const existingMatches = await this.prisma.match.findMany({
                select: {
                    match_id: true,
                    started: true,
                    finished: true,
                    game_variant: true,
                    location: true,
                },
                where: {
                   match_id: { in: matchItems.map(m => m.match_id) },
                },
            });

            const existingMatchesRaw = await this.prisma.match_raw.findMany({
                select: {
                    match_id: true,
                },
                where: {
                   match_id: { in: matchItems.map(m => m.match_id) },
                },
            });

            time();

            matchItems = matchItems.filter(matchItem => {
                const existingMatch = existingMatches.find(m => m.match_id === matchItem.match_id);
                return existingMatch == null ||
                    !isEqual(existingMatch.started, matchItem.started as Date) ||
                    !isEqual(existingMatch.finished, matchItem.finished as Date) ||
                    existingMatch.game_variant != matchItem.game_variant ||
                    existingMatch.location === 0;
            });

            matchRawItems = matchRawItems.filter(item => {
                return existingMatchesRaw.find(m => m.match_id === item.match_id) != null;
            });
            playerItems = playerItems.filter(item => {
                return matchItems.find(m => m.match_id === item.match_id) != null;
            });

            console.log('matchItems.length', matchItems.length);

            const uniqueProfileIds = uniq(playerItems.map(player => player.profile_id));
            const profileItems = uniqueProfileIds.map(profileId => ({profile_id: profileId}));

            time();

            for (const matchRawItemChunk of chunk(matchRawItems, 10)) {
                await upsertMany(this.prisma, 'match_raw', ['match_id'], matchRawItemChunk);
            }
            await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
            await upsertMany(this.prisma, 'match', ['match_id'], matchItems);
            await upsertMany(this.prisma, 'player', ['match_id', 'profile_id', 'slot'], playerItems);

            time();

            for (const profileId of profileIds) {
                const playerMatches = parsed.filter(m => m.players.find(p => p.profile_id === profileId) != null);
                const lastMatch = maxBy(playerMatches, m => m.finished);
                console.log(profileId, lastMatch?.finished);

                if (lastMatch != null) {
                    await this.setLastMatchFetchedTime(profileId, lastMatch.finished);
                } else {
                    console.log(pendingMatchChunk);
                    console.log(JSON.stringify(parsed.map(m => ({
                        match_id: m.match_id,
                        profileIds: m.players.map(p => p.profile_id),
                    })), null, 2));
                    console.log('no_last_match_found', profileId);
                }
            }

            await this.prisma.match_pending.deleteMany({
                where: {
                    profile_id: { in: profileIds },
                },
            });

            const matchesFinished = await this.prisma.match.findMany({
                include: {
                    players: {
                        include: {
                            profile: true,
                        }
                    },
                },
                where: {
                    match_id: {in: matchItems.map(m => m.match_id)},
                    finished: {gt: new Date(Date.now() - 1000 * 60 * 5)},
                },
                orderBy: {
                    finished: 'asc',
                },
            });

            if (matchesFinished.length > 0) {
                console.log('PUBSUB matches finished', matchesFinished.length);
                await this.pubSub.publish(PUBSUB_MATCH_FINISHED,
                    matchesFinished,
                );
            }

            time();

            this.metricMatchesImported += matchItems.length;
        }

        console.log(`Inserted ${pendingMatches.length} matches`);
    }

    async setLastMatchFetchedTime(profileId: number, lastMatchTime: Date) {
        await this.prisma.profile.update({
            where: {
                profile_id: profileId,
            },
            data: {
                last_match_fetched_time: lastMatchTime,
            },
        });
    }
}
