// SPDX-License-Identifier: AGPL-3.0-or-later

import { uniq } from "lodash";
import { getStatusEnumFromId } from "./enums";
import { getTranslation } from "../../../collector/src/helper/translation";


export function getTotalSlotCount(match: any) {
    return 8 - match.players.filter((p: any) => getStatusEnumFromId(p.status) == 'closed').length;
}

export function getBlockedSlotCount(match: any) {
    return match.players.filter((p: any) => {
        return getStatusEnumFromId(p.status) == 'ai' ||
            (getStatusEnumFromId(p.status) == 'player' && p.profile_id > 0);
    }).length;
}

export function getLobbyPlayerName(p: any) {
    if (getStatusEnumFromId(p.status) == 'player') {
        return p.profile_id > 0 ? null : 'Open';
    }
    return getTranslation('en', 'status', p.status);
}

export function getDiff(old: any, current: any): any {
    const keys = [...Object.keys(current), ...Object.keys(old)];
    const diff = {};
    for (const key of keys) {
        if (current[key] !== old[key]) {
            diff[key] = current[key];
        }
    }
    return diff;
}

export function getDiffEvents<T>(old: Record<string, T>, current: Record<string, T>, mapping: Record<string, string>, idGetter: (key: string) => any) {
    const keys = uniq([...Object.keys(current), ...Object.keys(old)]);
    const diff = [];
    for (const key of keys) {
        if (current[key] !== old[key]) {
            if (current[key] == null) {
                diff.push({
                    type: mapping['removed'],
                    data: { ...idGetter(key) },
                })
            } else if (old[key] == null) {
                diff.push({
                    type: mapping['added'],
                    data: current[key],
                })
            } else if (
                (typeof current[key] === 'object' || typeof current[key] === 'object')
            ) {
                const difference = getDiff(old[key], current[key]);
                if (Object.keys(difference).length > 0) {
                    diff.push({
                        type: mapping['updated'],
                        data: {
                            ...idGetter(key),
                            ...getDiff(old[key], current[key])
                        },
                    })
                }

            }
        }
    }
    return diff;
}

export function getDiffEventsAddRemove<T>(old: Record<string, T>, current: Record<string, T>, mapping: Record<string, string>, idGetter: (key: string) => any) {
    const keys = uniq([...Object.keys(current), ...Object.keys(old)]);
    const diff = [];
    for (const key of keys) {
        if (current[key] !== old[key]) {
            if (current[key] == null) {
                diff.push({
                    type: mapping['removed'],
                    data: { ...idGetter(key) },
                })
            } else if (old[key] == null) {
                diff.push({
                    type: mapping['added'],
                    data: current[key],
                })
            }
        }
    }
    return diff;
}
