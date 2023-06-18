// SPDX-License-Identifier: AGPL-3.0-or-later

import { Base64, decompressZlib } from "./util";

// 'H\x05\x00\x00\x0062:-1\x03\x00\x00\x000:0\x04\x00\x00\x0063:n\x05\x00\x00\x0093:30\x03\x00\x00\x001:n\x04\x00\x00\x0088:n\x03\x00\x00\x002:1\f\x00\x00\x0061:677407906\b\x00\x00\x0060:46545.\x00\x00\x0064:[Motz144]-CBA - 6x Gunpowder (both maps) V2\x04\x00\x00\x0090:n\x03\x00\x00\x005:0\x1B\x00\x00\x0053:o3gDQSq69EGmNuzZQG5wSA==\x03\x00\x00\x006:3\x05\x00\x00\x0052:72\x04\x00\x00\x0065:y\x04\x00\x00\x0086:0\x05\x00\x00\x0096:-1\x04\x00\x00\x0087:n\x04\x00\x00\x007:75\x03\x00\x00\x008:1\x04\x00\x00\x0057:2\x04\x00\x00\x0066:y\x04\x00\x00\x0067:y\x04\x00\x00\x009:-1\x04\x00\x00\x0010:0\x05\x00\x00\x0011:13\x04\x00\x00\x0094:0\x05\x00\x00\x0085:-1\x05\x00\x00\x0084:-1\x04\x00\x00\x0068:1\x04\x00\x00\x0069:5\x04\x00\x00\x0070:5\x04\x00\x00\x0071:1\x05\x00\x00\x0072:10\x05\x00\x00\x0013:50\x04\x00\x00\x0014:1\x05\x00\x00\x0015:70\x06\x00\x00\x0016:125\x04\x00\x00\x0017:1\x04\x00\x00\x0018:8\x04\x00\x00\x0019:1\b\x00\x00\x0073:10000\x04\x00\x00\x0020:0\x04\x00\x00\x0021:1\x05\x00\x00\x0022:60\x04\x00\x00\x0023:2\x05\x00\x00\x0024:60\x06\x00\x00\x0074:125\x05\x00\x00\x0025:20\x04\x00\x00\x0026:1\x05\x00\x00\x0027:62\x04\x00\x00\x0028:3\x04\x00\x00\x0075:8\x06\x00\x00\x0029:200\x04\x00\x00\x0037:0\x04\x00\x00\x0076:y\x04\x00\x00\x0092:n\x04\x00\x00\x0038:05\x00\x00\x0039:[Motz144]  CBA - 6x Tec Gunpowder_V13.aoe2scenario\x04\x00\x00\x0077:n\x04\x00\x00\x0056:1\x04\x00\x00\x0042:2\x04\x00\x00\x0091:n\x04\x00\x00\x0078:n\x04\x00\x00\x0079:y\x04\x00\x00\x0058:0\x04\x00\x00\x0080:n\b\x00\x00\x0081:14000\x04\x00\x00\x0082:0\x04\x00\x00\x0083:0\x04\x00\x00\x0059:2'

// [
//     'F',
//     '62:3', // difficulty
//     '0:0', // starting age
//     '63:n', // full tech tree
//     '93:30',
//     '1:n', // allow cheats
//     '88:y',
//     '2:1',
//     '61:0',
//     '60:0',
//     '90:n', // empire wars mode (inverted!)
//     '5:0', // ending age
//     '53:ZbSZcn1M/0msawKzRjbraw==',
//     '6:0', // game mode
//     '52:72',
//     '65:n',
//     '86:0',
//     '96:',
//     '1',
//     '87:y',
//     '7:75',
//     '8:0',
//     '57:2', // 2=private (tournament match)
//     '66:n', // lock speed
//     '67:y',  // lock teams (inverted!)
//     '9:4', // map size
//     '10:0',
//     '11:9', // location
//     '94:0',
//     '85:',
//     '1',
//     '84:',
//     '1',
//     '68:1',
//     '69:5',
//     '70:5',
//     '71:1',
//     '72:10',
//     '13:50',
//     '14:1',
//     '15:70',
//     '16:125',
//     '17:1',
//     '18:8',
//     '19:1',
//     '73:10000',
//     '20:0',
//     '21:1',
//     '22:60',
//     '23:2',
//     '24:60',
//     '74:125',
//     '25:20',
//     '26:1',
//     '27:62',
//     '28:3',
//     '75:8',
//     '29:150', // population
//     '37:0',
//     '76:y', // record game
//     '92:n', // regicide mode (inverted!)
//     '38:0', // resources
//     '77:n', // shared exploration (inverted!)
//     '56:1',
//     '42:3', // speed
//     '91:n', // sudden death mode (inverted!)
//     '78:n', // team positions
//     '79:y', // team together
//     '58:5', // treaty length
//     '80:n', // turbo mode (inverted!)
//     '81:',
//     '1',
//     '82:9', // victory
//     '83:0', // reveal map
//     '59:2'
// ]

// match id 184937392
// [
//     '',
//     '53:ABAg8bM3RUmhKrL21kz6kg==',
//     '8:1',
//     '57:2',
//     '9:0',
//     '11:112',
//     '94:6',
//     '73:10000',
//     '59:tr'
// ]

//     "39:default0.aoe2scenario" // custom scenario
//     "39:35319" // coop campaign

export function decompressOptions(str: string) {
    let optionsBase64: string;
    try {
        optionsBase64 = decompressZlib(str);
    } catch (e) {
        throw new Error(`Could not decompress settings: ${str}`);
    }
    let optionsStr: string;
    try {
        optionsStr = Base64.decode(optionsBase64);
    } catch (e) {
        throw new Error(`Could not base64 decode settings: ${optionsBase64}`);
    }

    // char codes < 32
    return optionsStr.split(/[\x00-\x1F]+/);
}

function getSettingByKeyOrNull(settings: string[], key: string) {
    // console.log(settings, key);
    const entry = settings.find(x => x.startsWith(`${key}:`));
    return entry ? entry.substr(entry.indexOf(':') + 1) : null;
}

export interface IOptionDict {
    record_game: boolean;
    empire_wars_mode: boolean;
    lock_teams: boolean;
    victory: number;
    shared_exploration: boolean;
    resources: number;
    team_positions: boolean;
    turbo_mode: boolean;
    full_tech_tree: boolean;
    speed: number;
    lock_speed: boolean;
    map_size: number;
    population: number;
    difficulty: number;
    team_together: boolean;
    allow_cheats: boolean;
    treaty_length: number;
    sudden_death_mode: boolean;
    reveal_map: number;
    ending_age: number;
    game_mode: number;
    location: number;
    regicide_mode: boolean;
    game_variant: number;
    starting_age: number;
    privacy: number;
    internal_leaderboard_id: number;
}

const optionsMapAfterReturnOfRomeRelease = {
    // Dont parse from options because we have it always in the match object in the relic api
    // 93: { name: 'internal_leaderboard_id', type: 'int' },

    0: { name: 'starting_age', type: 'int' },
    1: { name: 'allow_cheats', type: 'bool' },
    4: { name: 'ending_age', type: 'int' },
    5: { name: 'game_mode', type: 'int' },
    8: { name: 'map_size', type: 'int' },
    10: { name: 'location', type: 'int' },
    28: { name: 'population', type: 'int' },
    37: { name: 'resources', type: 'int' },
    41: { name: 'speed', type: 'int' },
    56: { name: 'privacy', type: 'int' },
    57: { name: 'treaty_length', type: 'int' },
    61: { name: 'difficulty', type: 'int' },
    62: { name: 'full_tech_tree', type: 'bool' },
    65: { name: 'lock_speed', type: 'bool' },
    66: { name: 'lock_teams', type: '!bool' },
    75: { name: 'record_game', type: 'bool' },
    76: { name: 'shared_exploration', type: '!bool' },
    77: { name: 'team_positions', type: 'bool' },
    78: { name: 'team_together', type: 'bool' },
    79: { name: 'turbo_mode', type: '!bool' },
    81: { name: 'victory', type: 'int' },
    82: { name: 'reveal_map', type: 'int' },
    89: { name: 'empire_wars_mode', type: '!bool' },
    90: { name: 'sudden_death_mode', type: '!bool' },
    91: { name: 'regicide_mode', type: '!bool' },
    97: { name: 'game_variant', type: 'int' }, // 1 means RoR, 97: 2 means AoE2.
}

const optionsMapBeforeReturnOfRomeRelease = {
    // Dont parse from options because we have it always in the match object in the relic api
    // 93: { name: 'internal_leaderboard_id', type: 'int' },

    0: { name: 'starting_age', type: 'int' },
    1: { name: 'allow_cheats', type: 'bool' },
    5: { name: 'ending_age', type: 'int' },
    6: { name: 'game_mode', type: 'int' },
    9: { name: 'map_size', type: 'int' },
    11: { name: 'location', type: 'int' },
    29: { name: 'population', type: 'int' },
    38: { name: 'resources', type: 'int' },
    42: { name: 'speed', type: 'int' },
    57: { name: 'privacy', type: 'int' },
    58: { name: 'treaty_length', type: 'int' },
    62: { name: 'difficulty', type: 'int' },
    63: { name: 'full_tech_tree', type: 'bool' },
    66: { name: 'lock_speed', type: 'bool' },
    67: { name: 'lock_teams', type: '!bool' },
    76: { name: 'record_game', type: 'bool' },
    77: { name: 'shared_exploration', type: '!bool' },
    78: { name: 'team_positions', type: 'bool' },
    79: { name: 'team_together', type: 'bool' },
    80: { name: 'turbo_mode', type: '!bool' },
    82: { name: 'victory', type: 'int' },
    83: { name: 'reveal_map', type: 'int' },
    90: { name: 'empire_wars_mode', type: '!bool' },
    91: { name: 'sudden_death_mode', type: '!bool' },
    92: { name: 'regicide_mode', type: '!bool' },
}

// dataVersion: parseBool(getSettingByKey(settings, '88')), // '88:y',

export function parseOptions(options: string[]): IOptionDict {
    // console.log('------------------');
    // console.log(settings);

    const optionsDict = {} as IOptionDict;

    const gameVariant = getSettingByKeyOrNull(options, '97');
    const optionsMap = gameVariant == null ? optionsMapBeforeReturnOfRomeRelease : optionsMapAfterReturnOfRomeRelease;

    // console.log('gameVariant', gameVariant);

    for (const optionNum of Object.keys(optionsMap)) {
        const value = getSettingByKeyOrNull(options, optionNum);
        const option = optionsMap[optionNum];
        optionsDict[option.name] = parseOption(value, option.type);
    }

    return optionsDict;
}

function parseOption(value, type) {
    switch (type) {
        case 'int':
            return value ? parseInt(value) : null;
        case 'bool':
            return value ? value === 'y' : null;
        case '!bool':
            return value ? value !== 'y' : null;
    }
}
