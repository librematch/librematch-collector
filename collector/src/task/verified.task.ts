// SPDX-License-Identifier: AGPL-3.0-or-later

import { CACHE_MANAGER, Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../service/prisma.service';
import fetch from "node-fetch";
import { fetchJson, makeQueryString, sleep } from "../helper/util";
import { CACHE_LOBBIES, PUBSUB_LOBBIES } from "./lobby.task";
import { PUB_SUB } from "../../../graph/src/modules/redis.module";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { Cache } from "cache-manager";
import { InjectSentry, SentryService } from "@ntegral/nestjs-sentry";
import { Cron, CronExpression } from "@nestjs/schedule";
import { putKv } from "../helper/kv-api";

export const CACHE_VERIFIED_PLAYERS = 'verified-players';
export const PUBSUB_VERIFIED_PLAYERS = 'verified-players';

@Injectable()
export class VerifiedTask implements OnApplicationBootstrap {
    private readonly logger = new Logger(VerifiedTask.name);

    constructor(
        private prisma: PrismaService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
        @Inject(CACHE_MANAGER) private cache: Cache,
        @InjectSentry() private readonly sentryService: SentryService,
    ) { }

    async onApplicationBootstrap() {
        await this.run();
    }

    @Cron(CronExpression.EVERY_HOUR)
    async run() {
        try {
            await this.fetchAoeReferenceData();
        } catch (e) {
            console.log(e);
            this.sentryService.instance().captureException(e);
        }
    }

    async fetchAoeReferenceData() {
        console.log(new Date(), 'FetchAoeReferenceData');

        const referenceUrl = 'https://raw.githubusercontent.com/SiegeEngineers/aoc-reference-data/master/data/players.yaml';
        const queryString = makeQueryString({
            url: referenceUrl,
        });
        const requestUrl = `https://yaml-to-json.vercel.app/api/convert?${queryString}`;
        const players = await fetchJson(requestUrl);

        await this.cache.set(CACHE_VERIFIED_PLAYERS, players, { ttl: 200 * 60 });
        await this.pubSub.publish(PUBSUB_VERIFIED_PLAYERS, players);
        // await putKv(CACHE_VERIFIED_PLAYERS, players);
    }
}
