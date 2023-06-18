// SPDX-License-Identifier: AGPL-3.0-or-later

import fetch from "node-fetch";
import { fetchJsonWithRetry, makeQueryString } from "./util";
import { IGetCommunityRecentMatchHistoryResult, IGetLeaderboard2Result } from "./community-api.types";

const apiKey = process.env.KV_API_KEY;

export async function putKv(key: string, value: any) {
    await putKvInternal(process.env.KV_URL, key, value);
    await putKvInternal('https://aoe2backend-worker.denniske.workers.dev', key, value);
}

export async function putKvInternal(baseUrl: string, key: string, value: any) {
    const queryString = makeQueryString({
        key,
    });

    const url = `${baseUrl}/kv/set?${queryString}`;
    console.log(url);
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(value),
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


export async function putMessage(key: string, value: any) {
    // await putMessageInternal(process.env.KV_URL, key, value);
    // await putMessageInternal('https://aoe2backend-worker.denniske.workers.dev', key, value);
    const result = await putMessageInternal('https://aoe2backend-socket.deno.dev/api/room/lobbies/ingest', key, value);
    console.log(result);
}

export async function putMessageInternal(baseUrl: string, key: string, value: any) {
    const queryString = makeQueryString({

    });

    const url = `${baseUrl}/api/room/${key}/ingest`;
    console.log(url);
    // console.log(JSON.stringify(value));
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(value),
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
