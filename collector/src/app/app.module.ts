import {CacheModule, DynamicModule, Injectable, Logger, Module, OnModuleInit} from '@nestjs/common';

import {PrismaService} from "../service/prisma.service";
import {ScheduleModule} from "@nestjs/schedule";
import {PubSubModule} from "../../../graph/src/modules/redis.module";
import {MatchTask} from "../task/match.task";
import {LeaderboardTask} from "../task/leaderboard.task";
import {StoreService} from "../service/store.service";
import {DebugTask} from "../task/debug.task";
import {ProfileTask} from "../task/profile.task";
import {ReimportTask} from "../task/reimport.task";
import {OngoingTask} from "../task/ongoing.task";
import {LobbyTask} from "../task/lobby.task";
import * as redisStore from 'cache-manager-redis-store';
import {SentryModule} from "@ntegral/nestjs-sentry";
import { RewriteFrames } from "@sentry/integrations";
import {ReplayTask} from "../task/replay.task";
import {VerifiedTask} from "../task/verified.task";
import {RedisService} from "../../../graph/src/service/redis.service";

@Module({
    providers: [
        PrismaService,
    ],
    exports: [
        PrismaService,
    ],
})
export class PrismaModule {
}

@Module({
    imports: [
        PrismaModule,
    ],
    providers: [
        StoreService,
    ],
    exports: [
        StoreService,
    ],
})
export class StoreModule {
}

@Module({})
export class TaskAndControllerModule {
    static forRoot(): DynamicModule {
        const providers = [];
        const controllers = [];

        if (process.env.SERVICE_NAME === 'debug') {
            providers.push(DebugTask);
        }
        if (process.env.SERVICE_NAME === 'reimport') {
            providers.push(ReimportTask);
        }
        if (process.env.SERVICE_NAME === 'replay') {
            providers.push(ReplayTask);
        }
        if (process.env.SERVICE_NAME === 'verified') {
            providers.push(VerifiedTask);
        }
        if (process.env.SERVICE_NAME === 'profile') {
            providers.push(ProfileTask);
        }
        if (process.env.SERVICE_NAME === 'match') {
            providers.push(MatchTask);
        }
        if (process.env.SERVICE_NAME === 'ongoing') {
            providers.push(RedisService);
            providers.push(OngoingTask);
        }
        if (process.env.SERVICE_NAME === 'lobby') {
            providers.push(RedisService);
            providers.push(LobbyTask);
        }
        if (process.env.SERVICE_NAME === 'leaderboard' ||
            process.env.SERVICE_NAME === 'leaderboard2') {
            providers.push(LeaderboardTask);
        }

        return {
            imports: [
                PrismaModule,
                StoreModule,
                PubSubModule,
                CacheModule.register({
                    isGlobal: true,
                    store: redisStore,
                    url: process.env.REDIS_URL,
                }),
            ],
            module: TaskAndControllerModule,
            controllers: controllers,
            providers: providers,
            exports: providers,
        };
    }
}

@Module({
    imports: [
        SentryModule.forRoot({
            dsn: 'https://eae93cfa561849adb3c28acfac66d0df@o431543.ingest.sentry.io/5385911',
            environment: process.env.ENVIRONMENT,
            enabled: process.env.ENVIRONMENT !== 'development',
            integrations: [
                new RewriteFrames({
                    root: global.__rootdir__,
                }),
            ],
        }),
        ScheduleModule.forRoot(),
        TaskAndControllerModule.forRoot(),
    ],
    controllers: [

    ],
    providers: [

    ],
})
export class AppModule {
}
