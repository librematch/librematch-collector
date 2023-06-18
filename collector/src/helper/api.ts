// SPDX-License-Identifier: AGPL-3.0-or-later

import { fetchJsonWithRetry, makeQueryString, sleep } from "./util";


const baseUrl = process.env.PROXY_URL;
const baseUrl2 = process.env.PROXY2_URL;
const baseUrlAoe2Companion = 'https://function.aoe2companion.com';
// const baseUrlAoe2Companion = 'http://localhost:3333';

export type IProfile = [number, number, ...any];
export type IObservableAdvertisement = [number, ...any];

export type IObservableAdvertisements = [
    number,
    IObservableAdvertisement[],
    IProfile[],
];

interface IApiConfig {
    appBinaryChecksum?: number;
}

const apiConfig: IApiConfig = {
    appBinaryChecksum: 83607,
};

export function patchApiConfig(config: IApiConfig) {
    Object.assign(apiConfig, config);
}

export async function getRecentMatchHistory(profile_ids: number[]): Promise<IObservableAdvertisements> {
    const queryString = makeQueryString({
        profile_ids: '[' + profile_ids.join(',') + ']',
        title: 'age2',
    });

    const url = `${baseUrl}/game/Leaderboard/getRecentMatchHistory?${queryString}`;
    console.log(url);
    return await fetchJsonWithRetry(url);
}

export async function getProfileName(profile_ids: number[]): Promise<IObservableAdvertisements> {
    const queryString = makeQueryString({
        profile_ids: '[' + profile_ids.join(',') + ']',
    });

    const url = `${baseUrl}/game/account/getProfileName?${queryString}`;
    console.log(url);
    return await fetchJsonWithRetry(url);
}

export interface IGetPlayerSummariesResult {
    code: number;
    message: string;
}

export interface IGetPlayerSummariesAvatar {
    profile_id: number;
    name: string;
    alias: string;
    personal_statgroup_id: number;
    xp: number;
    level: number;
    leaderboardregion_id: number;
    country: string;
}

export interface IGetPlayerSummariesPlayer {
    steamid: string;
    communityvisibilitystate: number;
    profilestate: number;
    personaname: string;
    commentpermission: number;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    avatarhash: string;
    personastate: number;
    realname: string;
    primaryclanid: string;
    timecreated: number;
    personastateflags: number;
    loccountrycode: string;
    locstatecode: string;
    loccityid?: number;
}

export interface IGetPlayerSummariesResponse {
    players: IGetPlayerSummariesPlayer[];
}

export interface IGetPlayerSummariesSteamResults {
    response: IGetPlayerSummariesResponse;
}

export interface IGetPlayerSummaries {
    result: IGetPlayerSummariesResult;
    avatars: IGetPlayerSummariesAvatar[];
    steamResults: IGetPlayerSummariesSteamResults;
}


export async function proxySteamUserRequest(profileNames: string[]): Promise<IGetPlayerSummaries> {
    const queryString = makeQueryString({
        profileNames: JSON.stringify(profileNames),
        request: '/ISteamUser/GetPlayerSummaries/v0002/',
    });

    const url = `${baseUrl}/community/external/proxysteamuserrequest?${queryString}`;
    console.log(url);
    return await fetchJsonWithRetry(url);
}

export async function getMatchesFromAoe2Companion(cursor: string = null, count: number = 200): Promise<{ next_cursor: string, matches: any[] }> {
    const queryString = makeQueryString({
        cursor,
        count,
    });

    const url = `${baseUrlAoe2Companion}/api/matches?${queryString}`;
    console.log(url);
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        console.log("FAILED", url);
        console.log(e);
        console.log("Trying again", url);
        await sleep(3000);
        return await getMatchesFromAoe2Companion(cursor, count);
    }
}

export async function getLeaderBoard(leaderboard_id: number = 0, start: number = 0, count: number = 200): Promise<IObservableAdvertisements> {
    const queryString = makeQueryString({
        start,
        count,
        leaderboard_id,
        title: 'age2',
    });

    const url = `${baseUrl2}/game/Leaderboard/getLeaderBoard?${queryString}`;
    console.log(url);
    return await fetchJsonWithRetry(url);
}

export async function findAdvertisements(start: number = 0, count: number = 200): Promise<IObservableAdvertisements> {
    const queryString = makeQueryString({
        appBinaryChecksum: apiConfig.appBinaryChecksum,
        versionFlags: 56950784,
        dataChecksum: 0,
        modDLLChecksum: 0,
        modDLLFile: 'INVALID',
        modName: 'INVALID',
        modVersion: 'INVALID',
        start,
        count,
        matchtype_id: 0,
    });

    const url = `${baseUrl}/game/advertisement/findAdvertisements?${queryString}`;
    console.log(url);
    return await fetchJsonWithRetry(url);
}

export async function findObservableAdvertisements(start: number = 0, count: number = 200): Promise<IObservableAdvertisements> {
    const queryString = makeQueryString({
        appBinaryChecksum: apiConfig.appBinaryChecksum,
        versionFlags: 56950784,
        dataChecksum: 0,
        modDLLChecksum: 0,
        modDLLFile: 'INVALID',
        modName: 'INVALID',
        modVersion: 'INVALID',
        start,
        count,
    });

    const url = `${baseUrl}/game/advertisement/findObservableAdvertisements?${queryString}`;
    console.log(url);
    return await fetchJsonWithRetry(url);
}
