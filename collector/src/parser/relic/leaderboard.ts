// SPDX-License-Identifier: AGPL-3.0-or-later

import { fromUnixTime } from "date-fns";
import { IGetLeaderboard2Result, ILeaderboardStat, IStatGroup } from "../../helper/community-api.types";

const sample =
    [
        0,
        [
            [
                1178783,
                "",
                "",
                1,
                [
                    1389164
                ]
            ],
            // ...
        ],
        [
            [
                /* 00 */ 54536,
                /* 01 */ 1389164,
                /* 02 */ "/steam/76561198240662592",
                /* 03 */ "{\"icon\":\"PR3-017\"}",
                /* 04 */ "The Illusionist",
                /* 05 */ "CZC",
                /* 06 */ 1178783,
                /* 07 */ 2381,
                /* 08 */ 2,
                /* 09 */ 0,
                /* 10 */ null,
                /* 11 */ "76561198240662592",
                /* 12 */ 3,
                /* 13 */[]
            ],
            // ...
        ],
        [
            [
                /* 00 */ 1178783,
                /* 01 */ 3,
                /* 02 */ 746,
                /* 03 */ 656,
                /* 04 */ -2,
                /* 05 */ 0,
                /* 06 */ 21,
                /* 07 */ 124,
                /* 08 */ 39434,
                /* 09 */ -1,
                /* 10 */ -1,
                /* 11 */ 1,
                /* 12 */ 2184,
                /* 13 */ 1663524940
            ],
            //...
        ],
    ];


const sample2 = {
    statGroups: [
        {
            "id": 1178783,
            "name": "",
            "type": 1,
            "members": [
                {
                    "profile_id": 1389164,
                    "name": "/steam/76561198240662592",
                    "alias": "The Illusionist",
                    "personal_statgroup_id": 1178783,
                    "xp": 2381,
                    "level": 2,
                    "leaderboardregion_id": 0,
                    "country": "sk"
                }
            ]
        },
        // ...
    ],
    leaderboardStats: [
        {
            "statgroup_id": 1178783,
            "leaderboard_id": 3,
            "wins": 746,
            "losses": 656,
            "streak": -2,
            "disputes": 0,
            "drops": 21,
            "rank": 124,
            "ranktotal": 39434,
            "ranklevel": 1,
            "rating": 2184,
            "regionrank": -1,
            "regionranktotal": -1,
            "lastmatchdate": 1663524940
        },
        // ...
    ],
};

export function leaderboardToCommunityLeaderboard(json: any[]): { statGroups: IStatGroup[], leaderboardStats: ILeaderboardStat[] } {
    return {
        statGroups: json[1].map((statGroup) => ({
            id: statGroup[6],
            name: "",
            type: 1,
            members: [
                {
                    profile_id: statGroup[1],
                    name: statGroup[2],
                    alias: statGroup[4],
                    personal_statgroup_id: statGroup[6],
                    xp: statGroup[7],
                    level: statGroup[8],
                    leaderboardregion_id: statGroup[9],
                    country: null, // missing
                    // clan: statGroup[5],
                    // iconData: statGroup[3],
                }
            ],
        })),
        leaderboardStats: json[2].map((leaderboardStat) => ({
            statgroup_id: leaderboardStat[0],
            leaderboard_id: leaderboardStat[1],
            wins: leaderboardStat[2],
            losses: leaderboardStat[3],
            streak: leaderboardStat[4],
            disputes: leaderboardStat[5],
            drops: leaderboardStat[6],
            rank: leaderboardStat[7],
            ranktotal: leaderboardStat[8], // until here same order
            ranklevel: leaderboardStat[11],
            rating: leaderboardStat[12],
            regionrank: leaderboardStat[9],
            regionranktotal: leaderboardStat[10],
            lastmatchdate: leaderboardStat[13],
        })),
    }
}
