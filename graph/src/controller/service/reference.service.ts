import {CACHE_MANAGER, Get, Inject, Injectable, Req, Response} from '@nestjs/common';
import {sendResponse} from "../../helper/util";
import {PrismaService} from "../../service/prisma.service";
import {PUB_SUB} from "../../modules/redis.module";
import {RedisPubSub} from "graphql-redis-subscriptions";
import {Cache} from "cache-manager";
import {CACHE_VERIFIED_PLAYERS} from "../../../../collector/src/task/verified.task";

export interface IReferencePlayer {
    name: string;
    country: string;
    esportsearnings: number;
    aoeelo: number;
    liquipedia: string;
    twitch: string;
    youtube: string;
    discord: string;
    discordServerId: string;
    platforms: {
        rl?: string[],
    };
    aka: string[];
    douyu: string;
    mixer: string;
}

@Injectable()
export class ReferenceService {

    referencePlayers: IReferencePlayer[] = [];
    referencePlayersDict: Record<number, IReferencePlayer> = {};

    constructor(
        protected prisma: PrismaService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) {

    }

    async onModuleInit() {
        await this.updateVerifiedPlayers();
    }

    async updateVerifiedPlayers() {
        this.referencePlayers = await this.cacheService.get(CACHE_VERIFIED_PLAYERS) || [];
        for (const player of this.referencePlayers) {
            for (const relicId of player.platforms.rl || []) {
                this.referencePlayersDict[relicId] = player;
            }
        }
    }
    @Get('/ready')
    async ready(@Req() req, @Response() res) {
        sendResponse(res, 'Ready.');
    }


}
