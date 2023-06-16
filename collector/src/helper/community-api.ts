import fetch from "node-fetch";
import {fetchJsonWithRetry, makeQueryString} from "./util";
import {IGetCommunityRecentMatchHistoryResult, IGetLeaderboard2Result} from "./community-api.types";

const baseUrl = process.env.HTTP_PROXY_URL;

export async function getLeaderBoard2(leaderboard_id: number = 0, start: number = 0, count: number = 200): Promise<IGetLeaderboard2Result> {
    const queryString = makeQueryString({
        start,
        count,
        leaderboard_id,
        platform: 'PC_STEAM',
        title: 'age2',
        sortBy: 1,
    });

    const url = `${baseUrl}/https://aoe-api.reliclink.com/community/leaderboard/getLeaderBoard2?${queryString}`;
    console.log(url);
    return await fetchJsonWithRetry(url);
}

export async function getCommunityRecentMatchHistory(profileIds: number[]): Promise<IGetCommunityRecentMatchHistoryResult> {
    const queryString = makeQueryString({
        profile_ids: '[' + profileIds.join(',') + ']',
        title: 'age2',
    });

    const url = `${baseUrl}/https://aoe-api.reliclink.com/community/leaderboard/getRecentMatchHistory?${queryString}`;
    console.log(url);
    return await fetchJsonWithRetry(url);
}
