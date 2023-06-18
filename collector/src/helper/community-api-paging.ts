// SPDX-License-Identifier: AGPL-3.0-or-later

import { ILeaderboardStat, IStatGroup } from "./community-api.types";
import { getLeaderBoard2 } from "./community-api";

export async function retrieveAllLeaderBoard2Blocks(leaderboard_id: number) {
    const allLeaderboardBlocks = [];

    const statGroups: IStatGroup[] = [];
    const leaderboardStats: ILeaderboardStat[] = [];
    let start = 1;
    while (true) {
        // while (start < 1000) {
        // await Promise.all([
        //
        // ]);
        const leaderboardEntriesResponse = await getLeaderBoard2(leaderboard_id, start);
        statGroups.push(...leaderboardEntriesResponse.statGroups);
        leaderboardStats.push(...leaderboardEntriesResponse.leaderboardStats);
        if (leaderboardEntriesResponse.leaderboardStats.length < 200) break;
        start += leaderboardEntriesResponse.leaderboardStats.length;
    }

    return { statGroups, leaderboardStats };
}
