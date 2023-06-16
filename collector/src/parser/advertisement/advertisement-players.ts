import {IParsedGenericPlayer} from "../match";

function parseColor(color: string) {
    // 4294967296 is not set
    if (color == '4294967295') return null;
    return parseInt(color) + 1;
}

export function parseAdvertisementSlotInfo(playersData: any[]) {
    playersData.forEach(pd => pd.metaData = parsePlayerMetadata(pd.metaData));

    return playersData.map((parsedData, i) => ({
        profile_id: parsedData["profileInfo.id"],
        slot: i,
        is_ready: parsedData.isReady,
        status: parsedData.status,
        won: null,

        ...(parsedData.metaData ? {
            // fixed order civ
            civ: parseInt(parsedData.metaData.civ),
            color: parseColor(parsedData.metaData.scenarioToPlayerIndex),
            team: parseInt(parsedData.metaData.team),
        } : {}),
    } as IParsedGenericPlayer));
}

function parsePlayerMetadata(playerMetadata: string) {
    if (!playerMetadata) return null;

    // ♥☺0☺7‼ScenarioPlayerIndex☺7♦Team☺3
    // -----0----7----ScenarioPlayerIndex----7----Team----3
    // -0-7-ScenarioPlayerIndex-7-Team-3

    // [ '', '1', '28', '0', '1', 'ScenarioPlayerIndex', '1', 'Team', '3' ]
    // [ '', '1', '33', '0', '2', 'ScenarioPlayerIndex', '2', 'Team', '1' ]
    // [ '', '1', '23', '0', '3', 'ScenarioPlayerIndex', '3', 'Team', '4' ]
    // [ '', '1', '39', '0', '5', 'ScenarioPlayerIndex', '5', 'Team', '4' ]
    // [ '', '1', '37', '0', '6', 'ScenarioPlayerIndex', '6', 'Team', '3' ]
    // [ '', '1', '21', '0', '7', 'ScenarioPlayerIndex', '7', 'Team', '3' ]
    // [ '', '1', '26', '0', '4', 'ScenarioPlayerIndex', '4', 'Team', '3' ]
    // [ '', '1', '10', '0', '0', 'ScenarioPlayerIndex', '0', 'Team', '6' ]

    // Team 1 is -
    // Team 2-5 is 1-4
    // Team 6 is ?

    playerMetadata = playerMetadata.split('').map(ch => ch.charCodeAt(0) < 32 ? '-' : ch).join('');
    playerMetadata = playerMetadata.replace(/-+/g, '-');
    const playerMetadataArr = playerMetadata.split('-');

    return {
        unknown1: playerMetadataArr[1],
        civ: playerMetadataArr[2],
        scenarioToPlayerIndex: playerMetadataArr[6],
        team: playerMetadataArr[8],
    };
}
