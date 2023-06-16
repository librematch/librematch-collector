import {CACHE_MANAGER, Inject, Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {PrismaService} from '../service/prisma.service';
import {Prisma} from '@prisma/client'
import {chunk, flatten, groupBy} from "lodash";
import {upsertMany} from "../helper/db";
import {differenceInMinutes, fromUnixTime} from "date-fns";
import {retrieveAllLeaderBoard2Blocks} from "../helper/community-api-paging";
import {ILeaderboardStat, IStatGroup} from "../helper/community-api.types";
import {retrieveAllLeaderBoardBlocks} from "../helper/api-paging";
import {InjectSentry, SentryService} from "@ntegral/nestjs-sentry";
import {leaderboardToCommunityLeaderboard} from "../parser/relic/leaderboard";
import {Cache} from "cache-manager";
import {putKv} from "../helper/kv-api";


interface IParsedLeaderboardRow {
    leaderboard_id: number;
    wins: number;
    last_match_time: Date;
    country?: string;
    drops: number;
    profile_id: number;
    name: string;
    rating: number;
    rank: number;
    streak: number;
    losses: number
}

@Injectable()
export class LeaderboardTask implements OnApplicationBootstrap {
    private readonly logger = new Logger(LeaderboardTask.name);

    leaderboardIdList = process.env.LEADERBOARD_IDS;

    constructor(
        private prisma: PrismaService,
        @InjectSentry() private readonly sentryService: SentryService,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) {}

    async onApplicationBootstrap() {
        setTimeout(() => this.importData(), 500);
        // await this.fetchLeaderboard([3]);
    }

    async importData() {
        try {
            await this.fetchLeaderboard(this.leaderboardIdList.split(',').map(x => parseInt(x)));
            console.log('Waiting 1min');
            setTimeout(() => this.importData(), 60 * 1000);
        } catch (e) {
            console.error(e);
            this.sentryService.instance().captureException(e);
            console.log('Restart importer in 60s');
            setTimeout(() => this.importData(), 60 * 1000);
        }
    }

    async fetchLeaderboard(leaderboardIds: number[]) {
        console.log();
        console.log('FetchLeaderboard', leaderboardIds);


        // await this.prisma.$queryRaw(`TRUNCATE TABLE \"${this.dbSchemaName}\".\"${tablename}\" CASCADE;`);

        const updatedAt = new Date();

        for (const leaderboardId of leaderboardIds) {
            const leaderboardEntries: Prisma.leaderboard_rowCreateManyInput[] = [];
            if (leaderboardId === 0) {
                const entries = await retrieveAllLeaderBoardBlocks(leaderboardId);
                const results = entries.map(leaderboardToCommunityLeaderboard);
                const parsed = this.parseLeaderboardRowsCommunity(
                    flatten(results.map(r => r.statGroups)),
                    flatten(results.map(r => r.leaderboardStats)),
                    leaderboardId
                );
                await this.storeLeaderboardRows(parsed, updatedAt);
                parsed.forEach(x => leaderboardEntries.push(x));
            } else {
                const { statGroups, leaderboardStats } = await retrieveAllLeaderBoard2Blocks(leaderboardId);
                const parsed = this.parseLeaderboardRowsCommunity(statGroups, leaderboardStats, leaderboardId);
                await this.storeLeaderboardRows(parsed, updatedAt);
                parsed.forEach(x => leaderboardEntries.push(x));
            }
            console.log(new Date(), 'DELETE lt updatedAt');
            await this.prisma.leaderboard_row.deleteMany({where: { leaderboard_id: leaderboardId, updated_at: { lt: updatedAt } }});
            await this.runSetRanks(leaderboardId);
            await this.runUpdateCountCache(leaderboardId);
        }

        // Only insert into match_pending on main leaderboard job to prevent deadlocks
        // It is the one with leaderboardId 3
        if (leaderboardIds.includes(3)) {
            // The match.finished and the leaderboard.last_match_time are not always in sync
            // ...so we allow for a 10s difference
            const insertedRowCount = await this.prisma.$executeRaw`
            INSERT INTO match_pending (profile_id, priority)
                SELECT profile_id, 0
                FROM profile p
                WHERE last_match_time is not null AND
                    (p.last_match_fetched_time is null OR p.last_match_fetched_time < p.last_match_time - interval '10 seconds')
            ON CONFLICT (profile_id)
            DO NOTHING;
        `;

            console.log(new Date(), `Queued ${insertedRowCount} matches for fetching with priority 0`);
        }

        console.log(new Date(), 'Done');
    }

    parseLeaderboardRowsCommunity(statGroups: IStatGroup[], leaderboardStats: ILeaderboardStat[], leaderboard_id: number): IParsedLeaderboardRow[] {
        return leaderboardStats.map(leaderboardStat => {
            const statGroup = statGroups.find(x => x.id === leaderboardStat.statgroup_id);
            return {
                leaderboard_id,
                profile_id: statGroup.members[0].profile_id,
                name: statGroup.members[0].alias,
                rating: leaderboardStat.rating,
                rank: leaderboardStat.rank,
                streak: leaderboardStat.streak,
                wins: leaderboardStat.wins,
                losses: leaderboardStat.losses,
                drops: leaderboardStat.drops,
                last_match_time: fromUnixTime(leaderboardStat.lastmatchdate),
                country: statGroup.members[0].country,
            };
        });
    }

    async storeLeaderboardRows(parsedLeaderboardRows: IParsedLeaderboardRow[], updatedAt: Date) {
        console.log();
        console.log('ParseLeaderboardRowsCommunity');

        const parsed: Prisma.leaderboard_rowCreateManyInput[] = [];

        for (const leaderboardStatChunk of chunk(parsedLeaderboardRows, 200)) {
            let leaderboardRowItems: Prisma.leaderboard_rowCreateManyInput[] = [];
            let profileItems: Prisma.profileCreateManyInput[] = [];
            let profileItems2: Prisma.profileCreateManyInput[] = [];
            let ratingItems: Prisma.ratingCreateManyInput[] = [];

            const previousRatings = await this.prisma.rating.findMany({
                where: {
                    OR: leaderboardStatChunk.map(leaderboardStat => ({
                        profile_id: leaderboardStat.profile_id,
                        leaderboard_id: leaderboardStat.leaderboard_id,
                        games: leaderboardStat.wins + leaderboardStat.losses - 1,
                    })),
                },
            });

            for (const leaderboardStat of leaderboardStatChunk) {
                leaderboardRowItems.push({
                    leaderboard_id: leaderboardStat.leaderboard_id,
                    profile_id: leaderboardStat.profile_id,
                    name: leaderboardStat.name,
                    rating: leaderboardStat.rating,
                    rank: leaderboardStat.rank,
                    streak: leaderboardStat.streak,
                    wins: leaderboardStat.wins,
                    losses: leaderboardStat.losses,
                    drops: leaderboardStat.drops,
                    last_match_time: leaderboardStat.last_match_time,
                    updated_at: updatedAt,
                });

                profileItems.push({
                    profile_id: leaderboardStat.profile_id,
                    name: leaderboardStat.name,
                    ...(leaderboardStat.country ? {country: leaderboardStat.country } : {}),
                });

                profileItems2.push({
                    profile_id: leaderboardStat.profile_id,
                    last_match_time: leaderboardStat.last_match_time,
                });

                const previousRating = previousRatings.find(x => x.profile_id === leaderboardStat.profile_id && x.leaderboard_id === leaderboardStat.leaderboard_id);

                ratingItems.push({
                    leaderboard_id: leaderboardStat.leaderboard_id,
                    profile_id: leaderboardStat.profile_id,
                    games: leaderboardStat.wins + leaderboardStat.losses,
                    date: leaderboardStat.last_match_time,
                    rating: leaderboardStat.rating,
                    rating_diff: previousRating ? leaderboardStat.rating - previousRating.rating : null,
                });
            }

            await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
            await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems2,
                Prisma.sql`WHERE profile.last_match_time is null OR profile.last_match_time < excluded.last_match_time`
            );
            await upsertMany(this.prisma, 'leaderboard_row', ['leaderboard_id', 'profile_id'], leaderboardRowItems);
            await upsertMany(this.prisma, 'rating', ['leaderboard_id', 'profile_id', 'games'], ratingItems);

            // for (const ratingItem of ratingItems) {
            //     await this.prisma.rating.update({
            //         where: {
            //             leaderboard_id_profile_id_games: {
            //                 leaderboard_id: ratingItem.leaderboard_id,
            //                 profile_id: ratingItem.profile_id,
            //                 games: ratingItem.games,
            //             },
            //         },
            //         data: {
            //             rating_diff: ratingItem.rating - Prisma.sql`previous_rating`,
            //         }
            //     })
            // }

            parsed.push(...leaderboardRowItems)
        }
        return parsed;
    }

    async runSetRanks(leaderboardId: number) {
        console.log(new Date(), 'Calculate leaderboard rank and rank_country');
        await this.prisma.$queryRaw`
            UPDATE leaderboard_row x
            SET rank_country = x2.rank_country
            FROM (
                SELECT
                    ROW_NUMBER() OVER (PARTITION BY leaderboard_id, p.country ORDER BY rank asc) as rank_country,
                    p.profile_id, leaderboard_id
                FROM leaderboard_row x3
                JOIN profile p ON p.profile_id = x3.profile_id
                WHERE leaderboard_id = ${leaderboardId}
            ) as x2
            where x.profile_id = x2.profile_id AND x.leaderboard_id = x2.leaderboard_id;
        `;

        console.log(new Date(), 'Done');
    }

    async runUpdateCountCache(leaderboardId: number) {
        console.log(new Date(), 'Update leaderboard count cache for', leaderboardId);

        const { _count } = await this.prisma.leaderboard_row.aggregate({
            _count: true,
            where: {
                leaderboard_id: leaderboardId,
            },
        });
        // console.log('_count', _count);

        const rows: { country: string, count: number }[] = await this.prisma.$queryRaw`
             SELECT country, COUNT(*)
             FROM leaderboard_row
             JOIN profile p on leaderboard_row.profile_id = p.profile_id
             WHERE leaderboard_id=${leaderboardId}
             GROUP BY country
        `;
        // console.log('rows', rows);

        const cache = {
            'world': _count,
        };
        rows.forEach(row => cache[row.country] = Number(row.count));

        const cacheKey = CACHE_LEADERBOARD_COUNT.replace('${leaderboardId}', leaderboardId.toString());
        await this.cache.set(cacheKey, cache, { ttl: 200 * 60 });
        // await putKv(cacheKey, cache);


        // console.log(cacheKey, cache);
        console.log('Updated cache');
    }
}

export const CACHE_LEADERBOARD_COUNT = 'leaderboard-count-${leaderboardId}';


// async runUpdateCountCache(leaderboardId: number, leaderboardEntries: Prisma.leaderboard_rowCreateManyInput[]) {
//     console.log(new Date(), 'Update leaderboard count cache');
//     const rows: IRow[] = await this.prisma.$queryRaw`
//          SELECT DISTINCT(leaderboard_id) as key, COUNT(*) FROM leaderboard_row
//          GROUP BY leaderboard_id
//     `;
//     // console.log('rows', rows);
//
//     const rows2: IRow[] = await this.prisma.$queryRaw`
//          SELECT DISTINCT(concat (leaderboard_id, ',', country)) as key, COUNT(*)
//          FROM leaderboard_row
//          JOIN profile p on leaderboard_row.profile_id = p.profile_id
//          GROUP BY leaderboard_id, country
//     `;
//     // console.log('rows2', rows2);
//
//     const cache = {
//         'world': leaderboardEntries.length,
//     };
//
//     const countries = groupBy(leaderboardEntries, x => x.country);
//
//     rows.forEach(row => cache[`(${row.key},null)`] = parseInt(row.count));
//     rows2.forEach(row => cache[`(${row.key})`] = parseInt(row.count));
//
//     const cacheKey = CACHE_LEADERBOARD_COUNT.replace('${leaderboardId}', leaderboardId);
//     await this.cache.set(cacheKey, cache, { ttl: 200 * 60 });
//
//     // console.log('this.cache', this.cache);
//     console.log('Updated cache');
// }

// async runUpdateCountCache(leaderboardId: number) {
//     console.log(new Date(), 'Update leaderboard count cache');
//     const rows: IRow[] = await this.prisma.$queryRaw`
//          SELECT DISTINCT(leaderboard_id) as key, COUNT(*) FROM leaderboard_row
//          GROUP BY leaderboard_id
//     `;
//     // console.log('rows', rows);
//
//     const rows2: IRow[] = await this.prisma.$queryRaw`
//          SELECT DISTINCT(concat (leaderboard_id, ',', country)) as key, COUNT(*)
//          FROM leaderboard_row
//          JOIN profile p on leaderboard_row.profile_id = p.profile_id
//          GROUP BY leaderboard_id, country
//     `;
//     // console.log('rows2', rows2);
//
//     const cache = {};
//     rows.forEach(row => cache[`(${row.key},null)`] = parseInt(row.count));
//     rows2.forEach(row => cache[`(${row.key})`] = parseInt(row.count));
//
//     await this.cache.set(CACHE_LEADERBOARD_COUNT, cache, { ttl: 200 * 60 });
//
//     // console.log('this.cache', this.cache);
//     console.log('Updated cache');
// }
