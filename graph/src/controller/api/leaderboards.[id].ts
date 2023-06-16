import {CACHE_MANAGER, Controller, Get, Inject, Param, Request, Response, UseGuards} from '@nestjs/common';
import {createZodDto} from 'nestjs-zod'
import {z} from 'nestjs-zod/z'
import {sendResponse} from "../../helper/util";
import {getLeaderboardEnumFromId, getLeaderboardIdFromEnum} from "../../helper/leaderboards";
import {PrismaService} from "../../service/prisma.service";
import {getParam} from "../legacy.controller";
import {Cache} from "cache-manager";

class ProfileSingleDto extends createZodDto(z.object({
    profile_id: z.string().regex(/^\d+$/).transform(Number),
})) {}

const PER_PAGE = 100;

interface IRow {
    key: string;
    count: string;
}


@Controller()
export class LeaderboardSingleController {

    constructor(
        protected prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) {

    }

    async onModuleInit() {

    }

    @Get('/api/leaderboards/:leaderboardId')
    async leaderboard(
        @Request() req,
        @Response() res,
        @Param() params,
    ) {
        // await sleep(2000);

        const page = parseInt(getParam(req.query, 'page') ?? '1');
        const leaderboardId = params.leaderboardId;
        let country = getParam(req.query, 'country') || null;
        const steamId = getParam(req.query, 'steam_id') || null;
        const profileId = parseInt(getParam(req.query, 'profile_id')) || null;
        const search = getParam(req.query, 'search') || null;

        const start = (page - 1) * PER_PAGE + 1;
        const count = PER_PAGE;

        if (country) {
            country = country.toLowerCase();
        }

        const conv = row => {
            row.leaderboardId = getLeaderboardEnumFromId(row.leaderboardId);
            row.games = row.wins + row.losses;
            row.country = row.profile.country;
            delete row.profile;
            return row;
        };

        if (profileId) {
            const leaderboardRow = await this.prisma.leaderboard_row.findUnique({
                include: {
                    profile: true,
                },
                where: {
                    leaderboard_id_profile_id: {
                        leaderboard_id: getLeaderboardIdFromEnum(leaderboardId),
                        profile_id: profileId,
                    },
                },
            });
            if (leaderboardRow == null) {
                return sendResponse(res, {
                    leaderboard_id: getLeaderboardIdFromEnum(leaderboardId),
                    players: [],
                });
            }
            return sendResponse(res, {
                leaderboard_id: getLeaderboardIdFromEnum(leaderboardId),
                players: [
                    conv(leaderboardRow),
                ],
            });
        }

        const leaderboardRows = await this.prisma.leaderboard_row.findMany({
            include: {
                profile: true,
            },
            where: {
                leaderboard_id: getLeaderboardIdFromEnum(leaderboardId),
                ...(country && {profile: {country}}),
                ...(search && {name: {contains: search, mode: "insensitive"}}),
                // ...(search && search.length <= 2 && {profile: {name: {equals: search, mode: "insensitive"}}}),
                // ...(search && search.length >  2 && {profile: {name: {contains: search, mode: "insensitive"}}}),
            },
            skip: start - 1,
            take: count,
            orderBy: {
                ['rank']: 'asc',
            },
        });

        // console.log(leaderboardRows);

        if (country) {
            leaderboardRows.forEach(row => row.rank = row.rank_country);
        }

        const cacheKey = CACHE_LEADERBOARD_COUNT.replace('${leaderboardId}', leaderboardId.toString());
        const cache = await this.cache.get(cacheKey) || {};
        const total = cache[country || 'world'] || 0;

        sendResponse(res, {
            leaderboard_id: leaderboardId,
            total: total,
            start: start,
            count: count,
            country: country,
            page: page,
            players: leaderboardRows.map(conv),
        });
    }
}

const CACHE_LEADERBOARD_COUNT = 'leaderboard-count-${leaderboardId}';
