import {CACHE_MANAGER, Controller, Get, Inject, Req, Request, Response, UseGuards} from '@nestjs/common';
import {Cache} from "cache-manager";
import {PrismaService} from "../service/prisma.service";
import {sendResponse} from "../helper/util";
import {PUB_SUB} from "../modules/redis.module";
import {RedisPubSub} from "graphql-redis-subscriptions";


import {createZodDto} from 'nestjs-zod'
import {z} from 'nestjs-zod/z'

class ProfileSingleDto extends createZodDto(z.object({
    profile_id: z.string().regex(/^\d+$/).transform(Number),
})) {}


@Controller()
export class DataController {

    constructor(
        protected prisma: PrismaService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) {

    }

    async onModuleInit() {

    }

    @Get('/api/error')
    async error(
        @Request() req,
        @Response() res,
    ) {
        throw new Error('Test error');
    }

    @Get('/ready')
    async ready(@Req() req, @Response() res) {
        sendResponse(res, 'Ready.');
    }
}
