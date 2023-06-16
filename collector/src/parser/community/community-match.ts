import {IGenericMatch, MatchHistoryStat} from "../../helper/community-api.types";

const sample = {
    "id": 180272347,
    "creator_profile_id": 10811664,
    "mapname": "Black_Forest.rms",
    "maxplayers": 6,
    "matchtype_id": 8,
    "options": "eNpFUttqwzAM/Zd+QXMz7NHB6RqYbFLsbdlbG4bBYXMZlCT++sm31E/C0tE50tHhogeKrwRjHV0wYpRA/nP3R+tDNjthYIn5jtxivhbs3sS/nsCQMNIurY/YuAhDOx8KSREDPiyEUTcfcAlkrDgR5y9yO0F9rU6zOreMf17a64f9U/L4EnuPBKgKWNRYZW1corbAo0vkOUWekbzJLnKyiXxHTZUwUxF76ayz4M5uSWcpfueA4cZjgs4G5w1/gNqBBsyKszURMx+F0ZGTKc+Z4mHn52bnKoW0RcRNuBMV867DfJirwrnWNOMKzhaZjzO7xv13uLdpaXWIcd5u40OqcVgTenc1akqaZ+ytY2/MA6NL6rkBy/70K/YJusH0hCevwAD6H7RsyF8CHUMfrwWMSvWKwF4/5jk21FImfzbBrEszo3b9Gmtnj0v8gL6kXbkxe9WAyb5C/cxP+eYKbvK8wyZMn+5rv8nK32TibXZfpc4e1sD2u1n3+3zeb437WuLOVSN+3h+HfxVG77A=",
    "slotinfo": "eNrN1F1PgzAUBmB/S6/RtAU6WOINbl0gTsdX3Wa86KDLCB8jgCbT+N8dRGNIpq5eLLs6h/bQJk/eFGHl8Q2U1XadZMIu1turJAZDBA2ECNEUUDe8SbaFPdovKqARPG9bqIA1j7429l8Vj0Tb4rYt0lvxIrLPjSKd8ibaBLuym7hsj0lyMRMVrXgupn43l9Se4PGuu6W987nulnPR8BFvOBgCO6WqF1LLDanqsq6OGfPaarHAuV9NnMYrsg17zbxFGk/uWLnw0zJZMadehpS2c25Ab7oaLv0VzebTsdP9HzxE5sy3r8G7cgDDGECIBj0L9dsC/WShndYilLawDlvMf7EwB8Qwid6zwOeXi0DWYl7K50LVMYaG2bPQjsgFgqfFcKUxYvlgIISJRhDpaejnlwxPGmPzjxcDYqTpRh+DHBONE78ZvrRG9kc0ni4+AJAF/Jk=",
    "description": "AUTOMATCH",
    "startgametime": 1663028042,
    "completiontime": 1663028665,
    "observertotal": 0,
    "matchhistoryreportresults": [
        {
            "matchhistory_id": 180272347,
            "profile_id": 10811664,
            "resulttype": 1,
            "teamid": 0,
            "race_id": 2,
            "xpgained": 1,
            "counters": "{}",
            "matchstartdate": 1663028042
        },
        {
            "matchhistory_id": 180272347,
            "profile_id": 1870017,
            "resulttype": 0,
            "teamid": 1,
            "race_id": 4,
            "xpgained": 1,
            "counters": "{}",
            "matchstartdate": 1663028042
        },
        {
            "matchhistory_id": 180272347,
            "profile_id": 9768965,
            "resulttype": 1,
            "teamid": 0,
            "race_id": 2,
            "xpgained": 1,
            "counters": "{}",
            "matchstartdate": 1663028042
        },
        {
            "matchhistory_id": 180272347,
            "profile_id": 3522089,
            "resulttype": 0,
            "teamid": 1,
            "race_id": 10,
            "xpgained": 1,
            "counters": "{}",
            "matchstartdate": 1663028042
        },
        {
            "matchhistory_id": 180272347,
            "profile_id": 11264616,
            "resulttype": 1,
            "teamid": 0,
            "race_id": 2,
            "xpgained": 1,
            "counters": "{}",
            "matchstartdate": 1663028042
        },
        {
            "matchhistory_id": 180272347,
            "profile_id": 10214586,
            "resulttype": 0,
            "teamid": 1,
            "race_id": 14,
            "xpgained": 1,
            "counters": "{}",
            "matchstartdate": 1663028042
        }
    ],
    "matchhistoryitems": [],
    "matchurls": [
        {
            "profile_id": 11264616,
            "url": "https://rl0aoelivemk2blob.blob.core.windows.net/cloudfiles/61646211/aoelive_/age2/replay/windows/4.0.0/0/M_180272347_48c7d82a969430587dce17531afc39d82339cffdfb54e651e0433ebbe8e4e28a.gz",
            "size": 563851,
            "datatype": 0
        },
        {
            "profile_id": 3522089,
            "url": "https://rl0aoelivemk2blob.blob.core.windows.net/cloudfiles/9802253/aoelive_/age2/replay/windows/4.0.0/0/M_180272347_9f770772f584b1f7f017b024d2d5ae57b8752b1f9787bf5ab78a02ee25baa942.gz",
            "size": 572385,
            "datatype": 0
        }
    ]
};


export function parseRelicMatchToCommunityMatch(json: MatchHistoryStat): IGenericMatch {
    return {
        type: 'match',
        ...json,
    };
}
