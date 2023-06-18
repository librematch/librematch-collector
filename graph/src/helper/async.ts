// SPDX-License-Identifier: AGPL-3.0-or-later

export async function asyncForeach<T>(array: T[], callback: (t: T) => Promise<void>) {
    const callbacks = array.map((item: any) => callback(item));
    return await Promise.all(callbacks);
}
