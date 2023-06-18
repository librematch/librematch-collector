// SPDX-License-Identifier: AGPL-3.0-or-later

import { Base64, cleanStr, decompressZlib } from "./util";

export function decompressSlotInfo(str: string) {
    let playersDataBlock: string;
    try {
        playersDataBlock = decompressZlib(str);
    } catch (e) {
        throw new Error(`Could not decompress player data: ${str}`);
    }

    // 12,[{"profileInfo.id":  ...  }]

    let playersDataStr: string;
    let playersData: any[];
    try {
        playersDataStr = playersDataBlock.substr(playersDataBlock.indexOf(',') + 1);
        playersData = JSON.parse(cleanStr(playersDataStr)) as any[];
    } catch (e) {
        throw new Error(`Could not parse player data json: ${playersDataStr}`);
    }

    // console.log('playersData', playersData);

    try {
        playersData.forEach(pd => pd.metaData = pd.metaData?.length > 0 ? Base64.decode(Base64.decode(pd.metaData)) : null);
        // console.log('playersData', playersData);
        return playersData;
    } catch (e) {
        throw new Error(`Could not decode player metadata: ${playersData.map(pd => pd.metaData)}`);
    }
}
