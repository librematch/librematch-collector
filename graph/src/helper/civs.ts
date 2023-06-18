// SPDX-License-Identifier: AGPL-3.0-or-later

export const civs = [
    {
        civId: 1,
        file: 'britons',
    },
    {
        civId: 2,
        file: 'franks',
    },
    {
        civId: 3,
        file: 'goths',
    },
    {
        civId: 4,
        file: 'teutons',
    },
    {
        civId: 5,
        file: 'japanese',
    },
    {
        civId: 6,
        file: 'chinese',
    },
    {
        civId: 7,
        file: 'byzantines',
    },
    {
        civId: 8,
        file: 'persians',
    },
    {
        civId: 9,
        file: 'saracens',
    },
    {
        civId: 10,
        file: 'turks',
    },
    {
        civId: 11,
        file: 'vikings',
    },
    {
        civId: 12,
        file: 'mongols',
    },
    {
        civId: 13,
        file: 'celts',
    },
    {
        civId: 14,
        file: 'spanish',
    },
    {
        civId: 15,
        file: 'aztecs',
    },
    {
        civId: 16,
        file: 'mayans',
    },
    {
        civId: 17,
        file: 'huns',
    },
    {
        civId: 18,
        file: 'koreans',
    },
    {
        civId: 19,
        file: 'italians',
    },
    {
        civId: 20,
        file: 'hindustanis',
    },
    {
        civId: 21,
        file: 'incas',
    },
    {
        civId: 22,
        file: 'magyars',
    },
    {
        civId: 23,
        file: 'slavs',
    },
    {
        civId: 24,
        file: 'portuguese',
    },
    {
        civId: 25,
        file: 'ethiopians',
    },
    {
        civId: 26,
        file: 'malians',
    },
    {
        civId: 27,
        file: 'berbers',
    },
    {
        civId: 28,
        file: 'khmer',
    },
    {
        civId: 29,
        file: 'malay',
    },
    {
        civId: 30,
        file: 'burmese',
    },
    {
        civId: 31,
        file: 'vietnamese',
    },
    {
        civId: 32,
        file: 'bulgarians',
    },
    {
        civId: 33,
        file: 'tatars',
    },
    {
        civId: 34,
        file: 'cumans',
    },
    {
        civId: 35,
        file: 'lithuanians',
    },
    {
        civId: 36,
        file: 'burgundians',
    },
    {
        civId: 37,
        file: 'sicilians',
    },
    {
        civId: 38,
        file: 'poles',
    },
    {
        civId: 39,
        file: 'bohemians',
    },
    {
        civId: 40,
        file: 'dravidians',
    },
    {
        civId: 41,
        file: 'bengalis',
    },
    {
        civId: 42,
        file: 'gurjaras',
    },
    {
        civId: 43,
        file: 'random',
    },
    {
        civId: 44,
        file: 'mirror',
    },
    {
        civId: 45,
        file: 'fullrandom',
    },
];

export function getCivImage(civId: number) {
    const civ = civs.find((m) => m.civId === civId);
    if (civ == null) {
        return '/maps/cm_generic.png';
    }
    return `https://aoe2companion.com/civilizations/${civ.file}.png`;
    // return `http://localhost:4200/civilizations/${civ.file}.png`;
}

// export function getMapName(map: number) {
//     if (map == null) {
//         return 'Custom';
//     }
//     return getString('map_type', map);
// }
