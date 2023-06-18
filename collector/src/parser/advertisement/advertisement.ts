// SPDX-License-Identifier: AGPL-3.0-or-later

import { IGenericMatch, IGenericMatchHistoryReportResult } from "../../helper/community-api.types";
import { parseGenericMatch } from "../match";

const sampleLobby = [
    /* 00 */ 185011748,
    /* 01 */ 109775242959349180,
    /* 02 */ "0",
    /* 03 */ 209525,
    /* 04 */ 0,
    /* 05 */ "test pls do not join 6",
    /* 06 */ "test pls do not join 6",
    /* 07 */ 1,
    /* 08 */ "my map",
    /* 09 */ "eNpFUs1O4zAQfheeIEkdSz1wcHEolrCtsg6rcKMBWThAKgQk9dPv2DPu5jTKzHw/8/nqwR8EfI0OcxQLVFJwU/7F088ulXKKNugF+x0/Yp9ZeWrxn+L6QDtuXnapksNig+hSaZ2AHZ3K2ob+mArjNP/zLtb+0/8+T9tfva8fj8325uFu9/W0X+qXWG0Re+Da93kXNG40aTMOtGUe3wDPLfIM/N51yClH/oqaNjaMNWL5orM2cT6TzsZ+sLxjwlh0tkW7Bu1aZP4VvK16yfutkeAz38bX9q1aqa5yjbjMho5wJ25Ii5Zzjf1xhX7WbSLcz6EHDXcxrnAfQC9yGwfexYB1AB2hp5mxeFqtnBlid6C/U4itE/aiJWGG5CfPn5Mf1K3ONgyUm4KsFWoJB26C2CMOaHGqpnnIUZX5pvjQcD8TFPHArfFWG9DOdj7PtmmP+CNkQBhjYz8neiuqvK8Ifirqby4ZQcbkt0pvFvvTeulH/z93d2qx37PLW5TpLeabMvD/TVgMsCg3Hy+5uIk//WXXV/8A1p3wJA==",
    /* 10 */ 0,
    /* 11 */ 8,
    /* 12 */ "eNrV0t1PwjAQAHD/lj4Ps07QSOLLYMUR+Vih3cD4ULaSjX2wjKlD4/+uLQ4l4sM0UXi66665u/4yqCm3zyDNlvMg4mYyX54GHmhq6mVDayhglbM8WCZmGzShAnLOYpGqCpgztyy8nTLm8m2ahDf8gUfbU4/lrj9ep/JGTbQJYj7kGcpYzHsjeS9YYc68tZwiZt6v5OeY56zNcgaawAy7OiZItwiqW1RGY0S6IupjgpCIluMhTxW16YBFqdO3/cXMLjRKvDrrUIcm0Zg+0cyO/MQKZY/+e68WpamDE6wTOQN3hyPzCrwoX2lqcIel9skF7riISgmzyX8lo37IaN/L2J6UIU5avkQvX0pCuHkpCtc0oVPbSB8nC9RyYTSZdYoF0wpoh57dNxAWmtigG1U6vaaxHxBCpTb/gYx20DLcqCoD98u0qsucHbLMwKr6zyC0V6YXVJep/5EM3JGpumXjKLY8P4otL/5py7uTVw6VMxQ=",
    /* 13 */ 0,
    /* 14 */[
        [
            185011748,
            209525,
            -1,
            2818,
            -1,
            -1,
            "/10.0.11.7"
        ]
    ],
    /* 15 */ 0,
    /* 16 */ 512,
    /* 17 */ 1,
    /* 18 */ 0,
    /* 19 */ 1,
    /* 20 */ 0,
    /* 21 */ null,
    /* 22 */ "westeurope",
    /* 23 */ null
];

const sampleObservable = [
    /* 00 */ 185011748,
    /* 01 */ 109775242959349180,
    /* 02 */ "0",
    /* 03 */ 209525,
    /* 04 */ 1,
    /* 05 */ "test pls do not join 6",
    /* 06 */ "test pls do not join 6",
    /* 07 */ 0,
    /* 08 */ "my map",
    /* 09 */ "eNpFUs1O4zAQfheeIEkdSz1wcHEolrCtsg6rcKMBWThAKgQk9dPv2DPu5jTKzHw/8/nqwR8EfI0OcxQLVFJwU/7F088ulXKKNugF+x0/Yp9ZeWrxn+L6QDtuXnapksNig+hSaZ2AHZ3K2ob+mArjNP/zLtb+0/8+T9tfva8fj8325uFu9/W0X+qXWG0Re+Da93kXNG40aTMOtGUe3wDPLfIM/N51yClH/oqaNjaMNWL5orM2cT6TzsZ+sLxjwlh0tkW7Bu1aZP4VvK16yfutkeAz38bX9q1aqa5yjbjMho5wJ25Ii5Zzjf1xhX7WbSLcz6EHDXcxrnAfQC9yGwfexYB1AB2hp5mxeFqtnBlid6C/U4itE/aiJWGG5CfPn5Mf1K3ONgyUm4KsFWoJB26C2CMOaHGqpnnIUZX5pvjQcD8TFPHArfFWG9DOdj7PtmmP+CNkQBhjYz8neiuqvK8Ifirqby4ZQcbkt0pvFvvTeulH/z93d2qx37PLW5TpLeabMvD/TVgMsCg3Hy+5uIk//WXXV/8A1p3wJA==",
    /* 10 */ 0,
    /* 11 */ 8,
    /* 12 */ "eNrV0ltPgzAUAGB/S5+ZGWWoI/EFRxeI03Gr24wPBUpGuIxANZnG/66tLkocMcxlZk/ntOe0PflSGUr3L6CsVnGSUbOIV6dJBDTYH6pQlUDNCEtWhTkCmiwBRknO074EYhJuCu+rioRU9Ax4XqTX9Ilmn5UinRAWLr11KVp6/J4kp1NaoYrkdOKKvqR2KInW4hn+6GMttnPKyIgwAjRgpkhxfKTbPlJsLKJhY4dHHXvWbTC2mFNkS/ycOfM0Gt/gcu6mZRJgq174CPE+exZdiegv3ABls4lhifPeXTicuuYleJV+WvTkhkPvG4TcgOCVjQS8+LNE/0sC/irhdJZY7lUCtkoo8LASXmeJcrsENnaSUFolDvwl/K4Qnr4dYrbblxi0Qnzk+5KQGxJdp1SPYsqzo5jy/J+mfDh5A10hH0c=",
    /* 13 */ 0,
    /* 14 */[
        [
            /* 00 */ 185011748,
            /* 01 */ 209525,
            /* 02 */ 23402,
            /* 03 */ 2818,
            /* 04 */ 14,
            /* 05 */ 0,
            /* 06 */ "/10.0.11.7"
        ]
    ],
    /* 15 */ 0,
    /* 16 */ 512,
    /* 17 */ 1,
    /* 18 */ 0,
    /* 19 */ 1,
    /* 20 */ 0,
    /* 21 */ 1665608963,
    /* 22 */ "westeurope",
    /* 23 */ null
];

const sampleRecentMatch = {
    "id": 185011748,
    "creator_profile_id": 209525,
    "mapname": "my map",
    "maxplayers": 8,
    "matchtype_id": 0,
    "options": "eNpFUs1O4zAQfheeIEkdSz1wcHEolrCtsg6rcKMBWThAKgQk9dPv2DPu5jTKzHw/8/nqwR8EfI0OcxQLVFJwU/7F088ulXKKNugF+x0/Yp9ZeWrxn+L6QDtuXnapksNig+hSaZ2AHZ3K2ob+mArjNP/zLtb+0/8+T9tfva8fj8325uFu9/W0X+qXWG0Re+Da93kXNG40aTMOtGUe3wDPLfIM/N51yClH/oqaNjaMNWL5orM2cT6TzsZ+sLxjwlh0tkW7Bu1aZP4VvK16yfutkeAz38bX9q1aqa5yjbjMho5wJ25Ii5Zzjf1xhX7WbSLcz6EHDXcxrnAfQC9yGwfexYB1AB2hp5mxeFqtnBlid6C/U4itE/aiJWGG5CfPn5Mf1K3ONgyUm4KsFWoJB26C2CMOaHGqpnnIUZX5pvjQcD8TFPHArfFWG9DOdj7PtmmP+CNkQBhjYz8neiuqvK8Ifirqby4ZQcbkt0pvFvvTeulH/z93d2qx37PLW5TpLeabMvD/TVgMsCg3Hy+5uIk//WXXV/8A1p3wJA==",
    "slotinfo": "eNrV0ltPgzAUAGB/S5+ZGWWoI/EFRxeI03Gr24wPBUpGuIxANZnG/66tLkocMcxlZk/ntOe0PflSGUr3L6CsVnGSUbOIV6dJBDTYH6pQlUDNCEtWhTkCmiwBRknO074EYhJuCu+rioRU9Ax4XqTX9Ilmn5UinRAWLr11KVp6/J4kp1NaoYrkdOKKvqR2KInW4hn+6GMttnPKyIgwAjRgpkhxfKTbPlJsLKJhY4dHHXvWbTC2mFNkS/ycOfM0Gt/gcu6mZRJgq174CPE+exZdiegv3ABls4lhifPeXTicuuYleJV+WvTkhkPvG4TcgOCVjQS8+LNE/0sC/irhdJZY7lUCtkoo8LASXmeJcrsENnaSUFolDvwl/K4Qnr4dYrbblxi0Qnzk+5KQGxJdp1SPYsqzo5jy/J+mfDh5A10hH0c=",
    "description": "test pls do not join 6",
    "startgametime": 1665608963,
    "completiontime": 1665609091,
    "observertotal": 0,
    "matchhistoryreportresults": [
        {
            "matchhistory_id": 185011748,
            "profile_id": 209525,
            "resulttype": 0,
            "teamid": 0,
            "race_id": 14,
            "xpgained": 1,
            "counters": "{}",
            "matchstartdate": 1665608963
        }
    ],
    "matchhistoryitems": [],
    "matchurls": [
        {
            "profile_id": 209525,
            "url": "https://rl0aoelivemk2blob.blob.core.windows.net/cloudfiles/525902/aoelive_/age2/replay/windows/4.0.0/0/M_185011748_1a114cba6dadd7e096e97f2d78bf9e5fe48a5dc8e126637c892a880658e2d22b.gz",
            "size": 1023688,
            "datatype": 0
        }
    ]
};


export function parseAdvertisement(json: any[]) {
    return parseGenericMatch(advertisementToGenericMatch(json));
}

export function parseObservableAdvertisement(json: any[]) {
    const match = parseGenericMatch(observableAdvertisementToGenericMatch(json));

    // Remove players with status 1 (closed slot)
    match.players = match.players.filter(p => p.status !== 1);

    return match;
}

export function advertisementToGenericMatch(json: any[]): IGenericMatch {
    return {
        type: 'lobby',

        lobbyId: json[1],
        server: json[22],

        id: json[0],
        creator_profile_id: json[3],
        mapname: json[8],
        maxplayers: json[11],
        matchtype_id: json[13],
        options: json[9],
        slotinfo: json[12],
        description: json[5],
        startgametime: null,
        completiontime: null,
        observertotal: null,
        matchhistoryreportresults: json[14].map(result => ({
            matchhistory_id: result[0],
            profile_id: result[1],
            resulttype: null,
            teamid: null,
            race_id: null,
            xpgained: null,
            counters: null,
            matchstartdate: null,
        } as IGenericMatchHistoryReportResult)),
        matchhistoryitems: null,
        matchurls: [],
    };
}

export function observableAdvertisementToGenericMatch(json: any[]): IGenericMatch {
    return {
        type: 'observable',

        lobbyId: json[1],
        server: json[22],

        id: json[0],
        creator_profile_id: json[3],
        mapname: json[8],
        maxplayers: json[11],
        matchtype_id: json[13],
        options: json[9],
        slotinfo: json[12],
        description: json[5],
        startgametime: json[21],
        completiontime: null,
        observertotal: null,
        matchhistoryreportresults: json[14].map(result => ({
            matchhistory_id: result[0],
            profile_id: result[1],
            resulttype: null,
            teamid: null,
            race_id: result[4],
            xpgained: null,
            counters: null,
            matchstartdate: null,
        } as IGenericMatchHistoryReportResult)),
        matchhistoryitems: null,
        matchurls: [],
    };
}
