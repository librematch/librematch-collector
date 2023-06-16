import {Args, Int, Query, Resolver} from "@nestjs/graphql";
import {PrismaService} from "../service/prisma.service";
import {LeaderboardRow, LeaderboardRowList} from "../object/leaderboard-row";


@Resolver(of => LeaderboardRow)
export class LeaderboardRowResolver {

    constructor(
        private prisma: PrismaService,
    ) {}

    @Query(returns => LeaderboardRowList)
    async leaderboard_rows(
        @Args("leaderboard_id", {type: () => Int}) leaderboard_id: number,
        @Args("start", {type: () => Int }) start: number,
        @Args("count", {type: () => Int }) count: number,
        @Args("search", {type: () => String, nullable: true }) search?: string,
    ): Promise<LeaderboardRowList> {

        console.log('leaderboard_rows', leaderboard_id, start, count);

        if (count > 10000) throw Error('count must be <= 10000');

        const total = await this.prisma.leaderboard_row.count({
            where: {
                leaderboard_id: leaderboard_id,
            },
        });

        const leaderboardRows = await this.prisma.leaderboard_row.findMany({
            include: {
                profile: true,
            },
            where: {
                leaderboard_id: leaderboard_id,
                ...(search && { name: { contains: search, mode: "insensitive" } }),
                // ...(country && { country }),
            },
            orderBy: {
                rating: 'desc',
            },
            skip: start - 1,
            take: count,
        });

        return {
            total,
            leaderboard_rows: leaderboardRows,
        };
    }
}
