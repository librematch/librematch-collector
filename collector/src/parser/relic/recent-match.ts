import {
    IGenericMatch,
    IGenericMatchHistoryReportResult,
    IGenericMatchUrl,
    MatchHistoryStat
} from "../../helper/community-api.types";
import {parseGenericMatch} from "../match";

const sample = [
        180272347,
        10811664,
        "Black_Forest.rms",
        6,
        8,
        "eNpFUttqwzAM/Zd+QXMz7NHB6RqYbFLsbdlbG4bBYXMZlCT++sm31E/C0tE50tHhogeKrwRjHV0wYpRA/nP3R+tDNjthYIn5jtxivhbs3sS/nsCQMNIurY/YuAhDOx8KSREDPiyEUTcfcAlkrDgR5y9yO0F9rU6zOreMf17a64f9U/L4EnuPBKgKWNRYZW1corbAo0vkOUWekbzJLnKyiXxHTZUwUxF76ayz4M5uSWcpfueA4cZjgs4G5w1/gNqBBsyKszURMx+F0ZGTKc+Z4mHn52bnKoW0RcRNuBMV867DfJirwrnWNOMKzhaZjzO7xv13uLdpaXWIcd5u40OqcVgTenc1akqaZ+ytY2/MA6NL6rkBy/70K/YJusH0hCevwAD6H7RsyF8CHUMfrwWMSvWKwF4/5jk21FImfzbBrEszo3b9Gmtnj0v8gL6kXbkxe9WAyb5C/cxP+eYKbvK8wyZMn+5rv8nK32TibXZfpc4e1sD2u1n3+3zeb437WuLOVSN+3h+HfxVG77A=",
        "eNrN1F1PgzAUBmB/S6/RtAU6WOINbl0gTsdX3Wa86KDLCB8jgCbT+N8dRGNIpq5eLLs6h/bQJk/eFGHl8Q2U1XadZMIu1turJAZDBA2ECNEUUDe8SbaFPdovKqARPG9bqIA1j7429l8Vj0Tb4rYt0lvxIrLPjSKd8ibaBLuym7hsj0lyMRMVrXgupn43l9Se4PGuu6W987nulnPR8BFvOBgCO6WqF1LLDanqsq6OGfPaarHAuV9NnMYrsg17zbxFGk/uWLnw0zJZMadehpS2c25Ab7oaLv0VzebTsdP9HzxE5sy3r8G7cgDDGECIBj0L9dsC/WShndYilLawDlvMf7EwB8Qwid6zwOeXi0DWYl7K50LVMYaG2bPQjsgFgqfFcKUxYvlgIISJRhDpaejnlwxPGmPzjxcDYqTpRh+DHBONE78ZvrRG9kc0ni4+AJAF/Jk=",
        "AUTOMATCH",
        1663028042,
        1663028665,
        0,
        [
            [
                180272347,
                10811664,
                1,
                0,
                2,
                1,
                "{}",
                "{\"itemUpdates\":[],\"challengeUpdates\":[],\"clientUpdates\":{}}",
                1663028042
            ],
            [
                180272347,
                1870017,
                0,
                1,
                4,
                1,
                "{}",
                "{\"itemUpdates\":[],\"challengeUpdates\":[],\"clientUpdates\":{}}",
                1663028042
            ],
            [
                180272347,
                9768965,
                1,
                0,
                2,
                1,
                "{}",
                "{\"itemUpdates\":[],\"challengeUpdates\":[],\"clientUpdates\":{}}",
                1663028042
            ],
            [
                180272347,
                3522089,
                0,
                1,
                10,
                1,
                "{}",
                "{\"itemUpdates\":[],\"challengeUpdates\":[],\"clientUpdates\":{}}",
                1663028042
            ],
            [
                180272347,
                11264616,
                1,
                0,
                2,
                1,
                "{}",
                "{\"itemUpdates\":[],\"challengeUpdates\":[],\"clientUpdates\":{}}",
                1663028042
            ],
            [
                180272347,
                10214586,
                0,
                1,
                14,
                1,
                "{}",
                "{\"itemUpdates\":[],\"challengeUpdates\":[],\"clientUpdates\":{}}",
                1663028042
            ]
        ],
        [],
        [
            [
                11264616,
                "https://rl0aoelivemk2blob.blob.core.windows.net/cloudfiles/61646211/aoelive_/age2/replay/windows/4.0.0/0/M_180272347_48c7d82a969430587dce17531afc39d82339cffdfb54e651e0433ebbe8e4e28a.gz",
                563851,
                0
            ],
            [
                3522089,
                "https://rl0aoelivemk2blob.blob.core.windows.net/cloudfiles/9802253/aoelive_/age2/replay/windows/4.0.0/0/M_180272347_9f770772f584b1f7f017b024d2d5ae57b8752b1f9787bf5ab78a02ee25baa942.gz",
                572385,
                0
            ]
        ],
        [
            "INVALID",
            "INVALID",
            "INVALID",
            0,
            0,
            66692,
            56950784
        ]
    ];

export function parseRecentMatch(json: any[]) {
    // console.log(json);
    // console.log(recentMatchToGenericMatch(json));
    const match = parseGenericMatch(recentMatchToGenericMatch(json));

    // Remove players with status 1 (closed slot)
    match.players = match.players.filter(p => p.status !== 1);

    return match;
}

export function recentMatchToGenericMatch(json: any[]): IGenericMatch {
    return {
        type: 'match',

        id: json[0],
        creator_profile_id: json[1],
        mapname: json[2],
        maxplayers: json[3],
        matchtype_id: json[4],
        options: json[5],
        slotinfo: json[6],
        description: json[7],
        startgametime: json[8],
        completiontime: json[9],
        observertotal: json[10],
        matchhistoryreportresults: json[11].map(result => ({
            matchhistory_id: result[0],
            profile_id: result[1],
            resulttype: result[2],
            teamid: result[3],
            race_id: result[4],
            xpgained: result[5],
            counters: result[6],
            matchstartdate: result[7],
        } as IGenericMatchHistoryReportResult)),
        matchhistoryitems: json[12], // .map?
        matchurls: json[13].map(url => ({
            profile_id: url[0],
            url: url[1],
            size: url[2],
            datatype: url[3],
        } as IGenericMatchUrl)),
    };
}
