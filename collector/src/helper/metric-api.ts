// SPDX-License-Identifier: AGPL-3.0-or-later

import fetch from "node-fetch";
import { fetchJsonWithRetry, makeQueryString } from "./util";
import { IGetCommunityRecentMatchHistoryResult, IGetLeaderboard2Result } from "./community-api.types";

const baseUrl = process.env.STATUS_URL;
const apiKey = process.env.STATUS_API_KEY;

export async function sendMetric(push_key: string, value: number = 0) {
    const queryString = makeQueryString({
        value,
    });

    const url = `${baseUrl}/api/push/${push_key}?${queryString}`;
    console.log(url);
    try {
        const response = await fetch(url, {
            headers: {
                apikey: apiKey,
            },
            timeout: 60 * 1000,
        });
        return await response.text();
    } catch (e) {
        console.log("FAILED", url);
        // throw e;
    }
}
