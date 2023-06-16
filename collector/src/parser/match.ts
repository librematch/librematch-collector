import {fromUnixTime} from "date-fns";
import {IGenericMatch} from "../helper/community-api.types";
import {decompressOptions, parseOptions} from "./options";
import {parseRecentMatchSlotInfo} from "./relic/recent-match-players";
import {decompressSlotInfo} from "./slotinfo";
import {parseAdvertisementSlotInfo} from "./advertisement/advertisement-players";

export const MATCH_PARSER_VERSION = 2;

export function parseGenericMatch(match: IGenericMatch): IParsedGenericMatch {
    const options = match.options ? parseOptions(decompressOptions(match.options)) : parseOptions([]);

    const players = match.type === 'lobby' ?
        parseAdvertisementSlotInfo(decompressSlotInfo(match.slotinfo)) :
        parseRecentMatchSlotInfo(decompressSlotInfo(match.slotinfo));

    match.matchhistoryreportresults.map(result => {
        const player = players.find(p => p.profile_id === result.profile_id);
        if (player) {
            player.match_id = match.id;
            player.won = result.resulttype == null ? null : (result.resulttype === 1);
        }
    });

    for (const player of players) {
        const matchurl = match.matchurls.find(url => url.profile_id === player.profile_id);
        if (!matchurl) {
            player.replay = false;
        }
    }

    return {
        match_id: match.id,
        creator_profile_id: match.creator_profile_id,
        internal_leaderboard_id: match.matchtype_id,
        leaderboard_id: matchTypeIdToLeaderboardId(match.matchtype_id),
        name: match.description,
        started: match.startgametime ? fromUnixTime(match.startgametime) : null,
        finished: match.completiontime ? fromUnixTime(match.completiontime) : null,
        players,
        server: match.server,
        ...options,
    }
}

export function matchTypeIdToLeaderboardId(matchTypeId: number) {
    switch (matchTypeId) {
        case 0:
            return 0; // Unranked

        case 2:
            return 1; // DM 1v1
        case 3:
        case 4:
        case 5:
            return 2; // DM Team

        case 6:
            return 3; // RM 1v1
        case 7:
        case 8:
        case 9:
            return 4; // RM Team

        case 10:
            return 5; // Battle Royale

        // case 11: return QUICK_PLAY_EW;
        // case 12: return QUICK_PLAY_EW_TEAM;
        // case 13: return QUICK_PLAY_EW_TEAM;
        // case 14: return QUICK_PLAY_EW_TEAM;
        // case 18: return QUICK_PLAY_RM;
        // case 19: return QUICK_PLAY_RM_TEAM;
        // case 20: return QUICK_PLAY_RM_TEAM;
        // case 21: return QUICK_PLAY_RM_TEAM;
        // case 25: return QUICK_PLAY_BR_FFA;

        case 26:
            return 13; // EW 1v1
        case 27:
        case 28:
        case 29:
            return 14; // EW Team
    }
    return null;
}

export interface IParsedGenericPlayer {
    profile_id: any;
    match_id: number;
    civ?: number;
    color?: number;
    is_ready: any;
    won?: boolean;
    slot: number;
    team?: number;
    status: any;
    replay?: boolean;
}

export interface IParsedGenericMatch {
    server?: string;

    match_id: number;
    creator_profile_id?: number;
    leaderboard_id: number;
    empire_wars_mode: boolean;
    lock_teams: boolean;
    privacy: number;
    full_tech_tree: boolean;
    speed: number;
    allow_cheats: boolean;
    reveal_map: number;
    regicide_mode: boolean;
    game_variant: number;
    record_game: boolean;
    players: IParsedGenericPlayer[];
    victory: number;
    shared_exploration: boolean;
    resources: number;
    internal_leaderboard_id: number;
    started: Date;
    finished: Date;
    team_positions: boolean;
    turbo_mode: boolean;
    lock_speed: boolean;
    map_size: number;
    population: number;
    difficulty: number;
    team_together: boolean;
    treaty_length: number;
    sudden_death_mode: boolean;
    ending_age: number;
    name: string;
    game_mode: number;
    location: number;
    starting_age: number;
}
