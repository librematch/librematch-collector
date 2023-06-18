// SPDX-License-Identifier: AGPL-3.0-or-later

export interface Result {
    code: number;
    message: string;
}

export interface Member {
    profile_id: number;
    name: string;
    alias: string;
    personal_statgroup_id: number;
    xp: number;
    level: number;
    leaderboardregion_id: number;
    country: string;
}

export interface IStatGroup {
    id: number;
    name: string;
    type: number;
    members: Member[];
}

export interface ILeaderboardStat {
    statgroup_id: number;
    leaderboard_id: number;
    wins: number;
    losses: number;
    streak: number;
    disputes: number;
    drops: number;
    rank: number;
    ranktotal: number;
    ranklevel: number;
    rating: number;
    regionrank: number;
    regionranktotal: number;
    lastmatchdate: number;
}

export interface IGetLeaderboard2Result {
    result: Result;
    statGroups: IStatGroup[];
    leaderboardStats: ILeaderboardStat[];
    rankTotal: number;
}


















export interface IGenericMatchHistoryReportResult {
    matchhistory_id: number;
    profile_id: number;
    resulttype: number;
    teamid: number;
    race_id: number;
    xpgained: number;
    counters: string;
    matchstartdate: number;
}

export interface IGenericMatchUrl {
    profile_id: number;
    url: string;
    size: number;
    datatype: number;
}

export interface IGenericMatch {
    type: 'lobby' | 'observable' | 'match';

    lobbyId?: number;
    server?: string;

    id: number;
    creator_profile_id: number;
    mapname: string;
    maxplayers: number;
    matchtype_id: number;
    options: string;
    slotinfo: string;
    description: string;
    startgametime: number;
    completiontime: number;
    observertotal: number;
    matchhistoryreportresults: IGenericMatchHistoryReportResult[];
    matchhistoryitems: any[];
    matchurls: IGenericMatchUrl[];
}








export interface Matchhistoryreportresult {
    matchhistory_id: number;
    profile_id: number;
    resulttype: number;
    teamid: number;
    race_id: number;
    xpgained: number;
    counters: string;
    matchstartdate: number;
}

export interface Matchurl {
    profile_id: number;
    url: string;
    size: number;
    datatype: number;
}

export interface MatchHistoryStat {
    id: number;
    creator_profile_id: number;
    mapname: string;
    maxplayers: number;
    matchtype_id: number;
    options: string;
    slotinfo: string;
    description: string;
    startgametime: number;
    completiontime: number;
    observertotal: number;
    matchhistoryreportresults: Matchhistoryreportresult[];
    matchhistoryitems: any[];
    matchurls: Matchurl[];
}

export interface Profile {
    profile_id: number;
    name: string;
    alias: string;
    personal_statgroup_id: number;
    xp: number;
    level: number;
    leaderboardregion_id: number;
    country: string;
}

export interface IGetCommunityRecentMatchHistoryResult {
    result: Result;
    matchHistoryStats: MatchHistoryStat[];
    profiles: Profile[];
}

