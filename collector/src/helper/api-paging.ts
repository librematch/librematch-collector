// SPDX-License-Identifier: AGPL-3.0-or-later

import fetch from "node-fetch";
import { makeQueryString } from "./util";
import {
    findAdvertisements,
    findObservableAdvertisements, getLeaderBoard,
    IObservableAdvertisement,
    IObservableAdvertisements, IProfile
} from "./api";
import { uniqBy } from "lodash";


export async function retrieveAllLeaderBoardBlocks(leaderboard_id: number): Promise<IObservableAdvertisement[]> {
    const allLeaderboardBlocks = [];

    let start = 1;
    while (true) {
        // while (start < 200) {
        const leaderboardEntriesResponse = await getLeaderBoard(leaderboard_id, start);
        const [num, ...leaderboardBlock] = leaderboardEntriesResponse;
        // console.log(leaderboardBlock);
        allLeaderboardBlocks.push(leaderboardBlock);
        if (leaderboardBlock[0].length < 200) break;
        start += leaderboardBlock[0].length;
    }

    return allLeaderboardBlocks;
}

export async function retrieveAllObservableAdvertisements(): Promise<[IObservableAdvertisement[], IProfile[]]> {
    let allObservableAdvertisements = [];
    let allProfiles = [];

    let start = 0;
    while (true) {
        const observableAdvertisementsResponse = await findObservableAdvertisements(start);

        const observableAdvertisements = observableAdvertisementsResponse[1];
        const profiles = observableAdvertisementsResponse[2];

        allObservableAdvertisements.push(...observableAdvertisements);
        allProfiles.push(...profiles);

        if (observableAdvertisements.length < 200) break;
        start += observableAdvertisements.length;
    }

    // Because we are fetching multiple pages there might be duplicate entries
    allObservableAdvertisements = uniqBy(allObservableAdvertisements, item => item[0]); // match_id
    allProfiles = uniqBy(allProfiles, item => item[0]); // profile_id

    return [allObservableAdvertisements, allProfiles];
}

export async function retrieveAllAdvertisements(): Promise<IObservableAdvertisement[]> {
    const allAdvertisements = [];

    let start = 0;
    while (true) {
        const observableAdvertisementsResponse = await findAdvertisements(start);
        const observableAdvertisements = observableAdvertisementsResponse[1];
        allAdvertisements.push(...observableAdvertisements);
        if (observableAdvertisements.length < 200) break;
        start += observableAdvertisements.length;
    }

    return allAdvertisements;
}
