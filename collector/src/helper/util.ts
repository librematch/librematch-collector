// SPDX-License-Identifier: AGPL-3.0-or-later

import fetch from "node-fetch";

interface IParams {
    [key: string]: any;
}

export function makeQueryString(params: IParams) {
    return Object.keys(params).filter(k => params[k] != null)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
}

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const apiKey = process.env.PROXY_API_KEY;

export async function fetchJson(url: string) {
    const response = await fetch(url, {
        headers: {
            apikey: apiKey,
        },
        timeout: 60 * 1000,
    });
    try {
        return await response.json();
    } catch (e) {
        console.log("FAILED", url, response);
        throw e;
    }
}

export async function fetchJsonWithRetry(url: string) {
    const response = await fetch(url, {
        headers: {
            apikey: apiKey,
        },
        timeout: 60 * 1000,
    });
    try {
        return await response.json();
    } catch (e) {
        console.log("FAILED", url, response);
        console.log(e);
        console.log("RETRY");
        // if (response.status === 500) {
        await sleep(3000);
        return await fetchJson(url);
        // }
    }
}
