import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {PrismaService} from '../service/prisma.service';
import fetch from "node-fetch";
import {sleep} from "../helper/util";

@Injectable()
export class ReplayTask implements OnApplicationBootstrap {
    private readonly logger = new Logger(ReplayTask.name);

    constructor(
        private prisma: PrismaService,
    ) {}

    async onApplicationBootstrap() {
        await this.run();
    }

    async run() {
        try {
            await this.verifyReplayExistence();
            setTimeout(() => this.run(), 1);
        } catch (e) {
            console.log(e);
        }
        // console.log('Waiting 10s');
        // setTimeout(() => this.run(), 10 * 1000);
    }

    async verifyReplayExistence() {
        console.log();
        console.log('VerifyReplayExistence');

        let players = await this.prisma.player.findMany({
            where: {
                replay: null,
            },
            // orderBy: {
            //     match_id: 'desc',
            // },
            // skip: 375,
            take: 5,
        });

        console.log('Found', players.length, 'replays to verify');

        for (const player of players) {
            const url = `https://aoe.ms/replay/?gameId=${player.match_id}&profileId=${player.profile_id}`;
            const hasReplay = await this.hasRec(player.match_id, player.profile_id);
            console.log(url, hasReplay);
            await this.prisma.player.update({
                where: {
                    match_id_profile_id_slot: {
                        match_id: player.match_id,
                        profile_id: player.profile_id,
                        slot: player.slot,
                    },
                },
                data: {
                    replay: hasReplay,
                },
            });
        }
    }

    async hasRec(matchId: number, profileId: number) {
        const url = `https://aoe.ms/replay/?gameId=${matchId}&profileId=${profileId}`;

        // HEAD request to a NON-EXISTENT resource will succeed with status 404.
        const response = await fetch(url, {
            method: 'HEAD',
        });
        if (response.status === 200) {
            return true;
        }
        if (response.status === 404) {
            return false;
        }
        throw new Error('Unknow response status: ' + response.status);
    }
}
