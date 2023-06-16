import {
    Args, ArgsType, createUnionType, Field, Int, Mutation, Parent, Query, ResolveField, Resolver, Root, Subscription
} from "@nestjs/graphql";
import {Match, MatchList} from "../object/match";
import {PrismaService} from "../service/prisma.service";
import {join} from '@prisma/client/runtime';
import {Inject} from "@nestjs/common";
import {PUB_SUB} from "../modules/redis.module";
import {RedisPubSub} from "graphql-redis-subscriptions";
import {parseISONullable} from "../helper/util";
import {mapIterator} from "../plugin/map.iterator";
import {filterIterator} from "../plugin/filter.iterator";
import {prefillIterator} from "../plugin/prefill.iterator";

// import {PubSub, withFilter} from "apollo-server-express";
// const pubSub = new PubSub();

function reviveMatch(match: any) {
    console.log('reviveMatch', match.match_id, match.started);
    match.started = parseISONullable(match.started);
    match.finished = parseISONullable(match.finished);
    return match;
}

async function reviveMatchById(prisma: PrismaService, matchId: any) {
    console.log('reviveMatch', matchId);
    const match = await prisma.match.findUnique({
        include: {
            players: {
                include: {
                    profile: true,
                },
            },
        },
        where: {
            match_id: matchId,
        },
    });
    // console.log('revived', match);
    return match;
}

export const MatchOrMatches = createUnionType({
    name: 'MatchOrMatchList',
    types: () => [Match, MatchList],
    resolveType(value: Match | MatchList) {
        if ((value as Match).match_id) {
            return Match;
        }
        return MatchList;
    },
});

@Resolver(of => Match)
export class MatchResolver {

    constructor(
        private prisma: PrismaService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
    ) {}

    @Query(returns => Match)
    async match(
        @Args("match_id", {nullable: true}) match_id?: number,
        @Args("match_uuid", {nullable: true}) match_uuid?: string
    ) {
        const match = await this.prisma.match.findUnique({
            include: {
                players: true,
            },
            where: {
                match_id: match_id,
            },
        });

        return match;
    }

    @Query(returns => MatchList)
    async matches(
        @Args("start", {type: () => Int }) start: number,
        @Args("count", {type: () => Int }) count: number,
        @Args("profile_ids", {type: () => [Int]}) profile_ids: number[],
        @Args("leaderboard_id", {type: () => Int, nullable: true}) leaderboard_id?: number,
    ) {
        if (count > 1000) throw Error('count must be <= 1000');

        let matchIds: any;
        if (leaderboard_id != null) {
            matchIds = await this.prisma.$queryRaw`
            SELECT m.match_id
            FROM player as p
            JOIN match as m ON m.match_id = p.match_id
            WHERE m.leaderboard_id=${leaderboard_id}
              AND profile_id IN (${join(profile_ids)})
            GROUP BY m.match_id, m.started
            ORDER BY m.started desc
            OFFSET ${start}
            LIMIT ${count}
          `;
        } else {
            matchIds = await this.prisma.$queryRaw`
            SELECT m.match_id
            FROM player as p
            JOIN match as m ON m.match_id = p.match_id
            WHERE profile_id IN (${join(profile_ids)})
            GROUP BY m.match_id, m.started
            ORDER BY m.started desc
            OFFSET ${start}
            LIMIT ${count}
          `;
        }

        const matches = await this.prisma.match.findMany({
            include: {
                players: { include: { profile: true }},
            },
            where: {
                match_id: {in: matchIds.map(x => x.match_id)}
            },
            orderBy: {
                started: 'desc',
            },
        });

        return {
            // total: matches.length, // Wrong
            matches,
        };
    }

    @Query(returns => MatchList)
    async ongoingMatches() {
        let matchIds: any = await this.prisma.$queryRaw`
            SELECT m.match_id
            FROM player as p
            JOIN match as m ON m.match_id = p.match_id
            WHERE m.finished is null
            GROUP BY m.match_id, m.started
            ORDER BY m.started desc
          `;

        const matches = await this.prisma.match.findMany({
            include: {
                players: { include: { profile: true }},
            },
            where: {
                match_id: {in: matchIds.map(x => x.match_id)}
            },
            orderBy: {
                started: 'desc',
            },
        });

        return {
            // total: matches.length, // Wrong
            matches,
        };
    }

    // @Subscription(returns => Match, { resolve: x => x })
    @Subscription(returns => MatchOrMatches, { resolve: x => x })
    async ongoingMatchesSub() {
        let matchIds: any = await this.prisma.$queryRaw`
            SELECT m.match_id
            FROM player as p
            JOIN match as m ON m.match_id = p.match_id
            WHERE m.finished is null
            GROUP BY m.match_id, m.started
            ORDER BY m.started desc
            LIMIT 5000
          `;

        const matches = await this.prisma.match.findMany({
            include: {
                players: { include: { profile: true }},
            },
            where: {
                match_id: {in: matchIds.map(x => x.match_id)}
            },
            orderBy: {
                started: 'desc',
            },
        });

        console.log('ongoingMatchesSub');


            // setTimeout(() => {
            //     this.pubSub.publish('match',
            //         matches[0],
            //     );
            // });
            // return filterIterator(
            //     mapIterator(this.pubSub.asyncIterator('match'), reviveMatch),
            //     match => {
            //         return true;
            //         // return match.players.some(p => p.profile_id == profile_id);
            //     }
            // );

        // return prefillIterator(mapIterator(this.pubSub.asyncIterator('ongoingMatches'), reviveMatch), matches);
        // return prefillIterator(mapIterator(this.pubSub.asyncIterator('ongoingMatches'), reviveMatch), [matches[0], matches[1], matches[2]]);
        return prefillIterator(mapIterator(this.pubSub.asyncIterator('ongoingMatches'), reviveMatch), [{matches}]);

        // return mapIterator(prefillIterator(this.pubSub.asyncIterator('ongoingMatches'), [matches[0]]), reviveMatch);

        throw Error('Not Found 404');
    }

    @Subscription(returns => Match, { resolve: x => x })
    async matchStartedSub() {
        console.log('matchStartedSub');
        // let matchIds: any;
        // matchIds = await this.prisma.$queryRaw`
        //     SELECT m.match_id
        //     FROM player as p
        //     JOIN match as m ON m.match_id = p.match_id
        //     WHERE profile_id = 209525
        //     ORDER BY m.started desc
        //     LIMIT 1
        //   `;
        //
        // const matches = await this.prisma.match.findMany({
        //     include: {
        //         players: true,
        //     },
        //     where: {
        //         match_id: {in: matchIds.map(x => x.match_id)}
        //     },
        //     orderBy: {
        //         started: 'desc',
        //     },
        // });
        // setTimeout(() => {
        //     this.pubSub.publish('match-started',
        //         matches[0],
        //     );
        // }, 1000);
        return filterIterator(
            mapIterator(this.pubSub.asyncIterator('match-started'), x => reviveMatchById(this.prisma, x)),
            match => {
                console.log('matchStartedSub', match);
                if (match.privacy === 0) return false;
                return true;
            }
        );
    }

    @Subscription(returns => Match, { resolve: x => x })
    async matchSub(
        @Args("profile_id", {type: () => Int, nullable: true}) profile_id?: number,
    ) {
        let matchIds: any;
        matchIds = await this.prisma.$queryRaw`
            SELECT m.match_id
            FROM player as p
            JOIN match as m ON m.match_id = p.match_id
            WHERE profile_id = ${profile_id}
            ORDER BY m.started desc
            LIMIT 1
          `;

        const matches = await this.prisma.match.findMany({
            include: {
                players: true,
            },
            where: {
                match_id: {in: matchIds.map(x => x.match_id)}
            },
            orderBy: {
                started: 'desc',
            },
        });

        if (matches.length === 1) {
            // setTimeout(() => {
            //     this.pubSub.publish('match',
            //         matches[0],
            //     );
            // }, 1000);
            return filterIterator(
                mapIterator(this.pubSub.asyncIterator('match'), reviveMatch),
                match => {
                    // return true;
                    console.log('matchSub', match);
                    return true;
                    // return match.players.some(p => p.profile_id == profile_id);
                }
            );
        }

        throw Error('Not Found 404');
    }


    @ResolveField()
    async players(@Parent() match: Match) {
        const players = match.players || await this.prisma.match
            .findUnique({
                where: {
                    match_id: match.match_id
                },
            })
            .players();

        // Hack: Augment player with leaderboard info to get games/wins in player resolver.
        return players.map(p => ({
            ...p,
            leaderboardId: match.leaderboard_id,
        }));
    }
}
