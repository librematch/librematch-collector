// SPDX-License-Identifier: AGPL-3.0-or-later

export interface ILeaderboard {
    leaderboardId: number;
    enum: string;
    name: string;
    abbreviation: string;
}


export const leaderboards: ILeaderboard[] = [
    {
        leaderboardId: 3,
        enum: 'rm_1v1',
        name: 'Random Leaderboard 1v1',
        abbreviation: 'RM 1v1',
    },
    {
        leaderboardId: 4,
        enum: 'rm_team',
        name: 'Random Leaderboard Team',
        abbreviation: 'RM Team',
    },
    {
        leaderboardId: 13,
        enum: 'ew_1v1',
        name: 'Empire Wars 1v1',
        abbreviation: 'EW 1v1',
    },
    {
        leaderboardId: 14,
        enum: 'ew_team',
        name: 'Empire Wars Team',
        abbreviation: 'EW Team',
    },
    {
        leaderboardId: 25,
        enum: 'ror_1v1',
        name: 'Return of Rome 1v1',
        abbreviation: 'ROR 1v1',
    },
    {
        leaderboardId: 26,
        enum: 'ror_team',
        name: 'Return of Rome Team',
        abbreviation: 'ROR Team',
    },
    {
        leaderboardId: 0,
        enum: 'unranked',
        name: 'Unranked',
        abbreviation: 'UNR',
    },
];

// export function getLeaderboardImage(leaderboardId: number) {
//     const leaderboard = leaderboards.find((m) => m.id === leaderboardId);
//     if (leaderboard == null) {
//         return '/leaderboards/cm_generic.png';
//     }
//     return `http://localhost:4200/leaderboards/${leaderboard.file}.png`;
// }

export function getLeaderboardEnumFromId(leaderboardId: number) {
    const leaderboard = leaderboards.find((m) => m.leaderboardId === leaderboardId);
    if (leaderboard == null) {
        return 'unknown';
    }
    return leaderboard.enum;
}

export function getLeaderboardIdFromEnum(leaderboardEnum: string) {
    const leaderboard = leaderboards.find((m) => m.enum === leaderboardEnum);
    if (leaderboard == null) {
        throw new Error(`Leaderboard enum ${leaderboardEnum} not found`);
    }
    return leaderboard.leaderboardId;
}
