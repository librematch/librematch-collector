import {Parent, ResolveField, Resolver} from "@nestjs/graphql";
import {PrismaService} from "../service/prisma.service";
import {Player} from "../object/player";


@Resolver(of => Player)
export class PlayerResolver {

    constructor(
        private prisma: PrismaService,
    ) {}

    // async getLeaderboard(leaderboardId: number, profileId: number) {
    //     console.log('DB FETCH LEADERBOARD ROW', leaderboardId, profileId);
    //     const leaderboard = await this.prisma.leaderboard_row.findUnique({
    //         where: {leaderboard_id_profile_id: {leaderboard_id: leaderboardId, profile_id: profileId}},
    //     });
    //     if (leaderboard == null) return null;
    //     return {
    //         leaderboard_id: leaderboardId,
    //         ...leaderboard,
    //     };
    // }
    //
    // @ResolveField()
    // async wins(@Parent() player: Player & { leaderboardId?: number }) {
    //     if (player.profile_id === 0) return null;
    //
    //     const leaderboard = await this.getLeaderboard(player.leaderboardId, player.profile_id);
    //     // console.log(leaderboard);
    //     return leaderboard.wins;
    // }
    //
    // @ResolveField()
    // async games(@Parent() player: Player & { leaderboardId?: number }) {
    //     if (player.profile_id === 0) return null;
    //
    //     const leaderboard = await this.getLeaderboard(player.leaderboardId, player.profile_id);
    //     // console.log(leaderboard);
    //     return leaderboard.games;
    // }
}
