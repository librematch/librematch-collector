// SPDX-License-Identifier: AGPL-3.0-or-later

export interface IMap {
    mapId: number;
    enum: string;
}

export const statusList: IMap[] = [
    {
        mapId: 0,
        enum: 'player',
    },
    {
        mapId: 1,
        enum: 'closed',
    },
    {
        mapId: 2,
        enum: 'ai',
    },
];

export function getStatusEnumFromId(mapId: number) {
    const map = statusList.find((m) => m.mapId === mapId);
    if (map == null) {
        return 'unknown';
    }
    return map.enum;
}

export function getStatusIdFromEnum(mapEnum: string) {
    const map = statusList.find((m) => m.enum === mapEnum);
    if (map == null) {
        return 'unknown';
    }
    return map.mapId;
}
