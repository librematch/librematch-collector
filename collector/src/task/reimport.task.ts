import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {PrismaService} from '../service/prisma.service';
import {Prisma} from '@prisma/client'
import {chunk, sortBy, uniq} from "lodash";
import {upsertMany} from "../helper/db";
import {parseRecentMatch, recentMatchToGenericMatch} from "../parser/relic/recent-match";
import {jsonDiff} from "@nrwl/workspace/src/utilities/json-diff";
import {diffString} from "json-diff";
import {MATCH_PARSER_VERSION} from "../parser/match";

@Injectable()
export class ReimportTask implements OnApplicationBootstrap {
    private readonly logger = new Logger(ReimportTask.name);

    constructor(
        private prisma: PrismaService,
    ) {}

    async onApplicationBootstrap() {
        await this.run();
    }

    async run() {
        try {
            await this.reimportMatches();
            setTimeout(() => this.run(), 1);
        } catch (e) {
            console.log(e);
        }
    }

    async reimportMatches() {
        console.log();
        console.log('ReimportMatches');

        let rawMatches = await this.prisma.match_raw.findMany({
            where: {
                // match_id: { in: [ 183456158 ] },
                OR: [
                    {version: { equals: null }},
                    {version: { lt: MATCH_PARSER_VERSION }},
                ],
                // error: true,
            },
            // skip: 375,
            take: 200,
        });

        console.log('Found', rawMatches.length, 'matches to reimport');

        let dbMatches = await this.prisma.match.findMany({
            include: {
                players: true,
            },
            where: {
                match_id: { in: rawMatches.map(m => m.match_id) },
            },
            // orderBy: {
            //     match_id: 'desc',
            // },
        });

        rawMatches = sortBy(rawMatches, m => m.match_id).reverse();
        dbMatches = sortBy(dbMatches, m => m.match_id).reverse();

        // console.log(JSON.stringify(dbMatches, null, 2));

        const parsed = [];

        for (const matchChunk of chunk(rawMatches, 10)) {
            const matchItems: Prisma.matchCreateManyInput[] = [];
            const playerItems: Prisma.playerCreateManyInput[] = [];

            for (const match of matchChunk) {
                try {
                    const parsedData = parseRecentMatch(JSON.parse(match.json));

                    const dbData = dbMatches.find(m => m.match_id === match.match_id);

                    // console.log('Match', match.match_id);
                    // console.log(diffString(dbData, parsedData));

                    parsed.push(parsedData);

                    const {players, ...matchData} = parsedData;

                    matchItems.push({
                        ...matchData,
                    });

                    players.forEach(parsedPlayerData => {
                        playerItems.push({
                            match_id: parsedData.match_id,
                            ...parsedPlayerData,
                        });
                    });
                } catch (e) {
                    console.log(new Date(), 'ERROR PARSING RECENT MATCH', match.match_id, e);
                    throw e;
                }
            }

            const uniqueProfileIds = uniq(playerItems.map(player => player.profile_id));
            const profileItems = uniqueProfileIds.map(profileId => ({profile_id: profileId}));

            await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
            await upsertMany(this.prisma, 'match', ['match_id'], matchItems);
            await upsertMany(this.prisma, 'player', ['match_id', 'profile_id', 'slot'], playerItems);

            await this.prisma.match_raw.updateMany({
                where: {
                    match_id: { in: matchItems.map(match => match.match_id) },
                },
                data: {
                    version: MATCH_PARSER_VERSION,
                    error: null,
                }
            })
        }

        console.log(new Date(), `Reimported ${parsed.length} matches`);

        return parsed;
    }
}
