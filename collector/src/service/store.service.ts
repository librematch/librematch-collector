// SPDX-License-Identifier: AGPL-3.0-or-later

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from "./prisma.service";
import { sleep } from "../helper/util";

@Injectable()
export class StoreService implements OnModuleInit, OnModuleDestroy {

    dictionary: Record<number, Date> = null;

    constructor(
        private prisma: PrismaService,
    ) {
    }

    async onModuleInit() {
        // const all = await this.prisma.profile.findMany({
        //     select: {
        //         profile_id: true,
        //         last_match_fetched_time: true,
        //     },
        // });
        //
        // this.dictionary = Object.assign({}, ...all.map((x) => ({[x.profile_id]: x.last_match_fetched_time})));

        // console.log('ALL', all);
        // console.log('dictionary', dictionary);
        // console.log('INITIALIZED DICT');

        // this.$use(async (params, next) => {
        //     const before = Date.now();
        //     const result = await next(params);
        //     const after = Date.now();
        //     console.log(
        //         `Query ${params.model}.${params.action} took ${after - before}ms`
        //     );
        //     return result;
        // });

        // (prisma.$on as any)('query', (e: any) => {
        //     e.timestamp;
        //     e.query;
        //     e.params;
        //     e.duration;
        //     e.target;
        //     console.log(e);
        // });
    }

    async waitForInit() {
        while (true) {
            if (this.dictionary != null) return;
            await sleep(100);
        }
    }

    getLastMatchFetchedTime(profileId: number) {
        return this.dictionary[profileId];
    }

    async setLastMatchFetchedTime(profileId: number, lastMatchTime: Date) {
        this.dictionary[profileId] = lastMatchTime;
        await this.prisma.profile.update({
            where: {
                profile_id: profileId,
            },
            data: {
                last_match_fetched_time: lastMatchTime,
            },
        });
    }

    async onModuleDestroy() {

    }
}
