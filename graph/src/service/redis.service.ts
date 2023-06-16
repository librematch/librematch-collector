import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    public redis: Redis;

    constructor() {
        console.log(process.env.REDIS_URL);
        this.redis = new Redis(process.env.REDIS_URL);
    }

    async onModuleInit() {

    }

    async onModuleDestroy() {

    }
}
