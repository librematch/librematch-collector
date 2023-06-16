import {IParsedGenericPlayer} from "../match";

function alphabeticalToFixedCiv(alphabeticalCiv: number) {
    // return alphabeticalCiv;
    const civName = alphabeticalCivs[alphabeticalCiv];
    return fixedCivs.indexOf(civName);
}

export function parseRecentMatchSlotInfo(playersData: any[]) {
    playersData.forEach(pd => pd.metaData = parsePlayerMetadata(pd.metaData));

    return playersData.map((parsedData, i) => ({
        profile_id: parsedData["profileInfo.id"],
        slot: i,
        is_ready: parsedData.isReady,
        status: parsedData.status,
        won: null,

        ...(parsedData.metaData ? {
            // raceID is alphabetical civ so we need to convert
            civ: alphabeticalToFixedCiv(parsedData.raceID),
            color: parseInt(parsedData.metaData.scenarioToPlayerIndex) + 1,
            team: parseInt(parsedData.metaData.team),
        } : {}),
    } as IParsedGenericPlayer));
}

function parsePlayerMetadata(playerMetadata: string) {
    if (!playerMetadata) return null;

    // ♥☺0☺7‼ScenarioPlayerIndex☺7♦Team☺3
    // -----0----7----ScenarioPlayerIndex----7----Team----3
    // -0-7-ScenarioPlayerIndex-7-Team-3
    // [ '', '0', '7', 'ScenarioPlayerIndex', '7', 'Team', '3' ]

    playerMetadata = playerMetadata.split('').map(ch => ch.charCodeAt(0) < 32 ? '-' : ch).join('');
    playerMetadata = playerMetadata.replace(/-+/g, '-');
    const playerMetadataArr = playerMetadata.split('-');

    return {
        unknown1: playerMetadataArr[1],
        civ: playerMetadataArr[2],
        scenarioToPlayerIndex: playerMetadataArr[4],
        team: playerMetadataArr[6],
    };
}

const alphabeticalCivs = [
    /* 00 */ 'Aztecs',
    /* 01 */ 'Bengalis',
    /* 02 */ 'Berbers',
    /* 03 */ 'Bohemians',
    /* 04 */ 'Britons',
    /* 05 */ 'Bulgarians',
    /* 06 */ 'Burgundians',
    /* 07 */ 'Burmese',
    /* 08 */ 'Byzantines',
    /* 09 */ 'Celts',
    /* 10 */ 'Chinese',
    /* 11 */ 'Cumans',
    /* 12 */ 'Dravidians',
    /* 13 */ 'Ethiopians',
    /* 14 */ 'Franks',
    /* 15 */ 'Goths',
    /* 16 */ 'Gurjaras',
    /* 17 */ 'Huns',
    /* 18 */ 'Incas',
    /* 19 */ 'Hindustanis',
    /* 20 */ 'Italians',
    /* 21 */ 'Japanese',
    /* 22 */ 'Khmer',
    /* 23 */ 'Koreans',
    /* 24 */ 'Lithuanians',
    /* 25 */ 'Magyars',
    /* 26 */ 'Malay',
    /* 27 */ 'Malians',
    /* 28 */ 'Mayans',
    /* 29 */ 'Mongols',
    /* 30 */ 'Persians',
    /* 31 */ 'Poles',
    /* 32 */ 'Portuguese',
    /* 33 */ 'Saracens',
    /* 34 */ 'Sicilians',
    /* 35 */ 'Slavs',
    /* 36 */ 'Spanish',
    /* 37 */ 'Tatars',
    /* 38 */ 'Teutons',
    /* 39 */ 'Turks',
    /* 40 */ 'Vietnamese',
    /* 41 */ 'Vikings',
    /* 42 */ 'Indians',
] as const;


const alphabeticalCivsReturnOfRome = [
    /* 00 */ 'Aztecs',
    /* 01 */ 'Bengalis',
    /* 02 */ 'Berbers',
    /* 03 */ 'Bohemians',
    /* 04 */ 'Britons',
    /* 05 */ 'Bulgarians',
    /* 06 */ 'Burgundians',
    /* 07 */ 'Burmese',
    /* 08 */ 'Byzantines',
    /* 09 */ 'Celts',
    /* 10 */ 'Chinese',
    /* 11 */ 'Cumans',
    /* 12 */ 'Dravidians',
    /* 13 */ 'Ethiopians',
    /* 14 */ 'Franks',
    /* 15 */ 'Goths',
    /* 16 */ 'Gurjaras',
    /* 17 */ 'Huns',
    /* 18 */ 'Incas',
    /* 19 */ 'Hindustanis',
    /* 20 */ 'Italians',
    /* 21 */ 'Japanese',
    /* 22 */ 'Khmer',
    /* 23 */ 'Koreans',
    /* 24 */ 'Lithuanians',
    /* 25 */ 'Magyars',
    /* 26 */ 'Malay',
    /* 27 */ 'Malians',
    /* 28 */ 'Mayans',
    /* 29 */ 'Mongols',
    /* 30 */ 'Persians',
    /* 31 */ 'Poles',
    /* 32 */ 'Portuguese',
    /* 33 */ 'Romans',
    /* 34 */ 'Saracens',
    /* 35 */ 'Sicilians',
    /* 36 */ 'Slavs',
    /* 37 */ 'Spanish',
    /* 38 */ 'Tatars',
    /* 39 */ 'Teutons',
    /* 40 */ 'Turks',
    /* 41 */ 'Vietnamese',
    /* 42 */ 'Vikings',
    /* 43 */ 'Indians',
] as const;

const alphabeticalCivsDynastiesOfIndia = [
    /* 00 */ 'Aztecs',
    /* 01 */ 'Bengalis',
    /* 02 */ 'Berbers',
    /* 03 */ 'Bohemians',
    /* 04 */ 'Britons',
    /* 05 */ 'Bulgarians',
    /* 06 */ 'Burgundians',
    /* 07 */ 'Burmese',
    /* 08 */ 'Byzantines',
    /* 09 */ 'Celts',
    /* 10 */ 'Chinese',
    /* 11 */ 'Cumans',
    /* 12 */ 'Dravidians',
    /* 13 */ 'Ethiopians',
    /* 14 */ 'Franks',
    /* 15 */ 'Goths',
    /* 16 */ 'Gurjaras',
    /* 17 */ 'Huns',
    /* 18 */ 'Incas',
    /* 19 */ 'Hindustanis',
    /* 20 */ 'Italians',
    /* 21 */ 'Japanese',
    /* 22 */ 'Khmer',
    /* 23 */ 'Koreans',
    /* 24 */ 'Lithuanians',
    /* 25 */ 'Magyars',
    /* 26 */ 'Malay',
    /* 27 */ 'Malians',
    /* 28 */ 'Mayans',
    /* 29 */ 'Mongols',
    /* 30 */ 'Persians',
    /* 31 */ 'Poles',
    /* 32 */ 'Portuguese',
    /* 34 */ 'Saracens',
    /* 34 */ 'Sicilians',
    /* 35 */ 'Slavs',
    /* 36 */ 'Spanish',
    /* 37 */ 'Tatars',
    /* 38 */ 'Teutons',
    /* 39 */ 'Turks',
    /* 40 */ 'Vietnamese',
    /* 41 */ 'Vikings',
    /* 42 */ 'Indians',
] as const;


const alphabeticalCivsDawnOfTheDukes = [
    /* 00 */ 'Aztecs',
    /* 01 */ 'Berbers',
    /* 02 */ 'Bohemians',
    /* 03 */ 'Britons',
    /* 04 */ 'Bulgarians',
    /* 05 */ 'Burgundians',
    /* 06 */ 'Burmese',
    /* 07 */ 'Byzantines',
    /* 08 */ 'Celts',
    /* 09 */ 'Chinese',
    /* 10 */ 'Cumans',
    /* 11 */ 'Ethiopians',
    /* 12 */ 'Franks',
    /* 13 */ 'Goths',
    /* 14 */ 'Huns',
    /* 15 */ 'Incas',
    /* 16 */ 'Indians',
    /* 17 */ 'Italians',
    /* 18 */ 'Japanese',
    /* 19 */ 'Khmer',
    /* 20 */ 'Koreans',
    /* 21 */ 'Lithuanians',
    /* 22 */ 'Magyars',
    /* 23 */ 'Malay',
    /* 24 */ 'Malians',
    /* 25 */ 'Mayans',
    /* 26 */ 'Mongols',
    /* 27 */ 'Persians',
    /* 28 */ 'Poles',
    /* 29 */ 'Portuguese',
    /* 30 */ 'Saracens',
    /* 31 */ 'Sicilians',
    /* 32 */ 'Slavs',
    /* 34 */ 'Spanish',
    /* 34 */ 'Tatars',
    /* 35 */ 'Teutons',
    /* 36 */ 'Turks',
    /* 37 */ 'Vietnamese',
    /* 38 */ 'Vikings',
] as const;

const alphabeticalCivsLordsOfTheWest = [
    /* 00 */ 'Aztecs',
    /* 01 */ 'Berbers',
    /* 02 */ 'Britons',
    /* 03 */ 'Bulgarians',
    /* 04 */ 'Burgundians',
    /* 05 */ 'Burmese',
    /* 06 */ 'Byzantines',
    /* 07 */ 'Celts',
    /* 08 */ 'Chinese',
    /* 09 */ 'Cumans',
    /* 10 */ 'Ethiopians',
    /* 11 */ 'Franks',
    /* 12 */ 'Goths',
    /* 13 */ 'Huns',
    /* 14 */ 'Incas',
    /* 15 */ 'Indians',
    /* 16 */ 'Italians',
    /* 17 */ 'Japanese',
    /* 18 */ 'Khmer',
    /* 19 */ 'Koreans',
    /* 20 */ 'Lithuanians',
    /* 21 */ 'Magyars',
    /* 22 */ 'Malay',
    /* 23 */ 'Malians',
    /* 24 */ 'Mayans',
    /* 25 */ 'Mongols',
    /* 26 */ 'Persians',
    /* 27 */ 'Portuguese',
    /* 28 */ 'Saracens',
    /* 29 */ 'Sicilians',
    /* 30 */ 'Slavs',
    /* 31 */ 'Spanish',
    /* 32 */ 'Tatars',
    /* 34 */ 'Teutons',
    /* 34 */ 'Turks',
    /* 35 */ 'Vietnamese',
    /* 36 */ 'Vikings',
] as const;

const alphabeticalCivsTheLastKhans = [
    /* 00 */ 'Aztecs',
    /* 01 */ 'Berbers',
    /* 02 */ 'Britons',
    /* 03 */ 'Bulgarians',
    /* 04 */ 'Burmese',
    /* 05 */ 'Byzantines',
    /* 06 */ 'Celts',
    /* 07 */ 'Chinese',
    /* 08 */ 'Cumans',
    /* 09 */ 'Ethiopians',
    /* 10 */ 'Franks',
    /* 11 */ 'Goths',
    /* 12 */ 'Huns',
    /* 13 */ 'Incas',
    /* 14 */ 'Indians',
    /* 15 */ 'Italians',
    /* 16 */ 'Japanese',
    /* 17 */ 'Khmer',
    /* 18 */ 'Koreans',
    /* 19 */ 'Lithuanians',
    /* 20 */ 'Magyars',
    /* 21 */ 'Malay',
    /* 22 */ 'Malians',
    /* 23 */ 'Mayans',
    /* 24 */ 'Mongols',
    /* 25 */ 'Persians',
    /* 26 */ 'Portuguese',
    /* 27 */ 'Saracens',
    /* 28 */ 'Slavs',
    /* 29 */ 'Spanish',
    /* 30 */ 'Tatars',
    /* 31 */ 'Teutons',
    /* 32 */ 'Turks',
    /* 34 */ 'Vietnamese',
    /* 34 */ 'Vikings',
] as const;

const fixedCivs = [
    /* 00 */ '',
    /* 01 */ 'Britons',
    /* 02 */ 'Franks',
    /* 03 */ 'Goths',
    /* 04 */ 'Teutons',
    /* 05 */ 'Japanese',
    /* 06 */ 'Chinese',
    /* 07 */ 'Byzantines',
    /* 08 */ 'Persians',
    /* 09 */ 'Saracens',
    /* 10 */ 'Turks',
    /* 11 */ 'Vikings',
    /* 12 */ 'Mongols',
    /* 13 */ 'Celts',
    /* 14 */ 'Spanish',
    /* 15 */ 'Aztecs',
    /* 16 */ 'Mayans',
    /* 17 */ 'Huns',
    /* 18 */ 'Koreans',
    /* 19 */ 'Italians',
    /* 20 */ 'Hindustanis',
    /* 21 */ 'Incas',
    /* 22 */ 'Magyars',
    /* 23 */ 'Slavs',
    /* 24 */ 'Portuguese',
    /* 25 */ 'Ethiopians',
    /* 26 */ 'Malians',
    /* 27 */ 'Berbers',
    /* 28 */ 'Khmer',
    /* 29 */ 'Malay',
    /* 30 */ 'Burmese',
    /* 31 */ 'Vietnamese',
    /* 32 */ 'Bulgarians',
    /* 33 */ 'Tatars',
    /* 34 */ 'Cumans',
    /* 35 */ 'Lithuanians',
    /* 36 */ 'Burgundians',
    /* 37 */ 'Sicilians',
    /* 38 */ 'Poles',
    /* 39 */ 'Bohemians',
    /* 40 */ 'Dravidians',
    /* 41 */ 'Bengalis',
    /* 42 */ 'Gurjaras',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Indians',
];

// console.log('Civs', alphabeticalToFixedCiv(0));

// let currentMapping = {};
// const currentAlphabeticalCivs = alphabeticalCivsRoR;
// for (const civName of currentAlphabeticalCivs) {
//     const alphabeticalCiv = currentAlphabeticalCivs.indexOf(civName);
//     // console.log(civName, alphabeticalCiv, alphabeticalToFixedCiv(alphabeticalCiv));
//     currentMapping[alphabeticalToFixedCiv(alphabeticalCiv)] = civName;
// }
//
// console.log('const mappingRoR = ' + JSON.stringify(currentMapping, null, 4));





//
// console.log('Civs');
//
// let currentMapping = {};
// const currentAlphabeticalCivs = alphabeticalCivsTheLastKhans;
// for (const civName of currentAlphabeticalCivs) {
//     const alphabeticalCiv = currentAlphabeticalCivs.indexOf(civName);
//     const alphabeticalCivReturnOfRome = alphabeticalCivsReturnOfRome.indexOf(civName);
//     currentMapping[alphabeticalToFixedCiv(alphabeticalCiv)] = {
//         civName,
//         alphabeticalCivReturnOfRome,
//         alphabeticalToFixedCiv: alphabeticalToFixedCiv(alphabeticalCiv),
//     };
// }
//
// console.log('const mappingRoR = {');
//
// for (const { civName, alphabeticalCivReturnOfRome, alphabeticalToFixedCiv } of Object.values(currentMapping) as any) {
//     console.log(`    '${alphabeticalToFixedCiv}': ${alphabeticalCivReturnOfRome}, // ${civName}`);
// }
//
// console.log('};');


