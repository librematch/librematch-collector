// SPDX-License-Identifier: AGPL-3.0-or-later

import { Prisma, PrismaClient } from "@prisma/client";

export async function upsertMany<T>(
    prisma: PrismaClient,
    table: string,
    identityColumns: string[],
    items: T[],
    onConflictUpdateWhere?: any,
    ignoredKeys: string[] = [],
) {
    if (items.length === 0) return;

    // Remove?
    // const ignoredKeys: string[] = [];

    const completeKeys: string[] = Object.keys(items[0]);

    const updateFieldsMapper = (item: any) => {
        return Prisma.sql`(${Prisma.join(
            completeKeys.map((key: string) => item[key])
        )})`;
    };

    const insertKeys = completeKeys.map((key) =>
        key.toLocaleLowerCase() !== key ? `"${key}"` : `${key}`
    );
    let insertValues = items.map((item) => updateFieldsMapper(item));

    const updateSet = completeKeys.reduce((updateSet: string[], key: string) => {
        if (!identityColumns.includes(key) && !ignoredKeys.includes(key)) {
            updateSet.push(`"${key}" = EXCLUDED."${key}"`);
        }
        return updateSet;
    }, []);

    // console.log('items');
    // console.log(insertValues);

    // Capture stack trace here because it gets lost in prisma.$executeRaw
    const stackTrace = new Error().stack;

    try {
        if (updateSet.length > 0) {
            return await prisma.$executeRaw`
              INSERT INTO ${Prisma.raw(table)} (${Prisma.raw(insertKeys.join(","))})
              VALUES ${Prisma.join(insertValues)}
              ON CONFLICT (${Prisma.raw(identityColumns.join(', '))})
              DO UPDATE SET ${Prisma.raw(updateSet.join(","))}
              ${onConflictUpdateWhere ? onConflictUpdateWhere : Prisma.empty};
          `;
        } else {
            return await prisma.$executeRaw`
              INSERT INTO ${Prisma.raw(table)} (${Prisma.raw(insertKeys.join(","))})
              VALUES ${Prisma.join(insertValues)}
              ON CONFLICT (${Prisma.raw(identityColumns.join(', '))})
              DO NOTHING
              ${onConflictUpdateWhere ? onConflictUpdateWhere : Prisma.empty};
          `;
        }
    } catch (e) {
        console.log(`Error upserting items`);
        console.log(items);
        console.log(`into ${table}`);
        console.log(stackTrace);
        throw e;
    }
}
