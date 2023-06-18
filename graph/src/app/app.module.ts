// SPDX-License-Identifier: AGPL-3.0-or-later

import { CacheModule, DynamicModule, Injectable, Logger, MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';

import { PrismaService } from "../service/prisma.service";
import { ScheduleModule } from "@nestjs/schedule";
import { GraphQLModule } from "@nestjs/graphql";
import { PlayerResolver } from "../resolver/player.resolver";
import { MatchResolver } from "../resolver/match.resolver";
import { PubSubModule } from "../modules/redis.module";
import { LeaderboardRowResolver } from "../resolver/leaderboard-row.resolver";
import { ProfileResolver } from "../resolver/profile.resolver";
import { LobbyResolver } from "../resolver/lobby.resolver";
import { LegacyController } from "../controller/legacy.controller";
import { ApolloDriver } from '@nestjs/apollo';
import { HttpProxyController } from "../controller/http-proxy.controller";
import { LoggingMiddleware } from "../plugin/logging.middleware";
import { ThrottlerModule } from "@nestjs/throttler";
import { DataController } from "../controller/data.controller";
import { ReadyController } from "../controller/ready.controller";
import * as redisStore from 'cache-manager-redis-store';
import { OngoingResolver } from "../resolver/ongoing.resolver";
import { SentryModule } from "@ntegral/nestjs-sentry";
import { RewriteFrames } from "@sentry/integrations";
import { ZodValidationPipe } from "nestjs-zod";
import { APP_PIPE } from "@nestjs/core";
import { LoggingPlugin } from "../plugin/logging.plugin";
import { LeaderboardController } from "../controller/api/leaderboards";
import { LeaderboardSingleController } from "../controller/api/leaderboards.[id]";
import { MatchesController } from "../controller/api/matches";
import { ProfileSingleController } from "../controller/api/profiles.[id]";
import { ProfileController } from "../controller/api/profiles";
import { MapController } from "../controller/api/maps";
import { ReferenceService } from "../controller/service/reference.service";
import { ProfileService } from "../controller/service/profile.service";
import { SocketGateway, SocketController } from "../controller/socket.controller";
import { RedisService } from "../service/redis.service";
import { ProxyController } from "../controller/proxy.controller";


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


@Module({})
export class ResolverModule {
    static forRoot(): DynamicModule {
        const imports = [];
        const providers = [];
        const controllers = [];

        if (process.env.SERVICE_NAME === 'http-proxy') {
            controllers.push(HttpProxyController);
        }
        if (process.env.SERVICE_NAME === 'proxy' || process.env.SERVICE_NAME === 'proxy2') {
            imports.push(PrismaModule);
            controllers.push(ProxyController);
        }
        if (process.env.SERVICE_NAME === 'socket') {
            imports.push(
                CacheModule.register({
                    isGlobal: true,
                    store: redisStore,
                    url: process.env.REDIS_URL,
                }));
            imports.push(PrismaModule);
            imports.push(PubSubModule);
            providers.push(RedisService);
            providers.push(SocketGateway);
            controllers.push(SocketController);
        }
        if (process.env.SERVICE_NAME === 'legacy') {
            controllers.push(LegacyController);
            imports.push(
                CacheModule.register({
                    isGlobal: true,
                    store: redisStore,
                    url: process.env.REDIS_URL,
                }));
            imports.push(PrismaModule);
        }
        if (process.env.SERVICE_NAME === 'data') {
            controllers.push(...[
                DataController,
                LeaderboardSingleController,
                LeaderboardController,
                MapController,
                MatchesController,
                ProfileSingleController,
                ProfileController,
            ]);
            providers.push(...[
                ReferenceService,
                ProfileService,
            ]);
            imports.push(
                CacheModule.register({
                    isGlobal: true,
                    store: redisStore,
                    url: process.env.REDIS_URL,
                }));
            imports.push(PrismaModule);
            imports.push(PubSubModule);
        }
        if (process.env.SERVICE_NAME === 'graph') {
            const graphqlModule = GraphQLModule.forRoot({
                // tracing: true,
                driver: ApolloDriver,
                // installSubscriptionHandlers: true,
                subscriptions: {
                    'graphql-ws': true,
                    // Both active will lead to 'invalid date' error
                    // 'subscriptions-transport-ws': true,
                },
                autoSchemaFile: 'graph/schema.graphql',
                sortSchema: true,
                // playground: true,
                playground: {
                    version: '1.7.40',
                    settings: {
                        'schema.polling.enable': false,
                    } as any
                }
            });

            const resolvers = [
                PlayerResolver,
                MatchResolver,
                LeaderboardRowResolver,
                ProfileResolver,
                LobbyResolver,
                OngoingResolver,
            ];

            imports.push(
                CacheModule.register({
                    isGlobal: true,
                    store: redisStore,
                    url: process.env.REDIS_URL,
                }),);
            imports.push(PrismaModule);
            imports.push(PubSubModule);
            imports.push(graphqlModule);
            providers.push(...resolvers);
            providers.push(SchemaJsonTask);
            providers.push(LoggingPlugin);
            controllers.push(ReadyController);
        }

        return {
            imports: imports,
            module: ResolverModule,
            controllers: controllers,
            providers: providers,
            exports: providers,
        };
    }

    configure(consumer: MiddlewareConsumer) {
        if (process.env.SERVICE_NAME === 'legacy' ||
            process.env.SERVICE_NAME === 'data' ||
            process.env.SERVICE_NAME === 'graph') {
            consumer
                .apply(LoggingMiddleware)
                .forRoutes('api');
        }
    }
}


const fs2json = require('fs-to-json').fs2json;

@Injectable()
export class SchemaJsonTask implements OnModuleInit {
    private readonly logger = new Logger(SchemaJsonTask.name);

    async onModuleInit() {
        await fs2json({ input: 'graph/schema.graphql', output: 'graph/schema.json' });
        this.logger.log('Created schema.json');
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
            beforeSend(event, hint) {
                event.tags = event.tags || {};
                event.tags['service_name'] = process.env.SERVICE_NAME;
                return event;
            },
        }),
        ScheduleModule.forRoot(),
        ResolverModule.forRoot(),
        // ThrottlerModule.forRoot({
        //     ttl: 60,
        //     limit: 100,
        // }),
    ],
    controllers: [],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
        // LoggingPlugin,
    ],
})
export class AppModule {
}
