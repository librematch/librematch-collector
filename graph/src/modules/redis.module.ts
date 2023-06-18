// SPDX-License-Identifier: AGPL-3.0-or-later

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Global, Module } from '@nestjs/common';

export const PUB_SUB = 'PUB_SUB';

console.log('----------------------');

@Global()
@Module({
    // imports: [ConfigModule],
    providers: [
        {
            provide: PUB_SUB,
            useFactory: (
                // configService: ConfigService
            ) => new RedisPubSub({
                reviver: (key, value) => {
                    // console.log('revive', { key, value });
                    return value;
                },
                connection: process.env.REDIS_URL as any,
            }),
            // inject: [ConfigService]
        }
    ],
    exports: [PUB_SUB],
})
export class PubSubModule { }
