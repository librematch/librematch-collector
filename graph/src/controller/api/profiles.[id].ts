import {Controller, Get, Param, Response, UseGuards} from '@nestjs/common';
import {createZodDto} from 'nestjs-zod'
import {z} from 'nestjs-zod/z'
import {sendResponse} from "../../helper/util";
import {getTranslation} from "../../../../collector/src/helper/translation";
import {getLeaderboardEnumFromId, leaderboards} from "../../helper/leaderboards";
import {PrismaService} from "../../service/prisma.service";
import {ProfileService} from "../service/profile.service";
import {maxBy} from "lodash";
import {ReferenceService} from "../service/reference.service";
import {flagEmojiDict} from "../../helper/flags";

class ProfileSingleDto extends createZodDto(z.object({
    profile_id: z.string().regex(/^\d+$/).transform(Number),
})) {
}

const PER_PAGE = 20;


@Controller()
export class ProfileSingleController {

    constructor(
        protected prisma: PrismaService,
        protected profileService: ProfileService,
        protected referenceService: ReferenceService,
    ) {

    }

    @Get('/api/profiles/:profile_id')
    async profile(
        @Param() params: ProfileSingleDto,
        @Response() res,
    ) {
        const profileId = params.profile_id;

        const language = 'en';

        const [
            profile,
            leaderboards,
            ratings,
            stats,
        ] = await Promise.all([
            (async () => (await this.profileService.getProfiles({profileId}))[0])(),
            this.getLeaderboards(profileId, language),
            this.getRatings(profileId, language),
            this.getStats(profileId, language),
        ]);

        profile.verified = this.referenceService?.referencePlayersDict?.[profileId] != null;
        profile.countryIcon = flagEmojiDict[profile.country?.toUpperCase()];

        leaderboards.forEach((l: any) => {
            const ratingList = ratings.find(r => r.leaderboardId === l.leaderboardId)?.ratings ?? [];
            l.maxRating = maxBy(ratingList, r => r.rating)?.rating;
        });

        // await asyncForeach(leaderboards, async (l: any) => {
        //     console.log(l);
        //     const ratingList = await prisma.rating.aggregate({
        //         _max: {
        //             rating: true,
        //         },
        //         where: {
        //             leaderboard_id: getLeaderboardIdFromEnum(l.leaderboardId),
        //         },
        //     });
        //     console.log(ratingList);
        //     l.maxRating = ratingList._max.rating;
        // });

        sendResponse(res, {
            ...profile,
            leaderboards,
            ratings,
            stats,
        });
    }

    private async getLeaderboards(profileId: number, language: string) {
        let leaderboardRows = await this.prisma.leaderboard_row.findMany({
            where: {
                profile_id: profileId,
            },
        });

        const conv = row => ({
            leaderboardId: getLeaderboardEnumFromId(row.leaderboardId),
            leaderboardName: getTranslation(language, 'leaderboard', row.leaderboardId),
            abbreviation: row.abbreviation,
            ...(leaderboardRows.find(l => l.leaderboard_id === row.leaderboardId) ?? {}),
        });

        return leaderboards.map(conv);
    }

    private async getRating(profileId: number, leaderboard_id: number) {
        return await this.prisma.rating.findMany({
            // select: {
            //     leaderboard_id: true,
            //     rating: true,
            //     date: true,
            // },
            where: {
                profile_id: profileId,
                leaderboard_id: leaderboard_id,
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    private async getRatings(profileId: number, language: string) {
        // let ratings = await this.prisma.rating.findMany({
        //     // select: {
        //     //     leaderboard_id: true,
        //     //     rating: true,
        //     //     date: true,
        //     // },
        //     where: {
        //         profile_id: profileId,
        //     },
        //     orderBy: {
        //         date: 'desc',
        //     },
        // });

        const conv = async row => ({
            leaderboardId: getLeaderboardEnumFromId(row.leaderboardId),
            leaderboardName: getTranslation(language, 'leaderboard', row.leaderboardId),
            abbreviation: row.abbreviation,
            // ratings: ratings.filter(r => r.leaderboard_id === row.leaderboardId),
            ratings: await this.getRating(profileId, row.leaderboardId),
        });

        return await Promise.all(leaderboards.map(conv));
    }

    private async getStats(profileId: number, language: string) {
        const conv = async row => ({
            leaderboardId: getLeaderboardEnumFromId(row.leaderboardId),
            leaderboardName: getTranslation(language, 'leaderboard', row.leaderboardId),
            abbreviation: row.abbreviation,
            ...await this.getStatsForLeaderboard(row.leaderboardId, profileId),
        });

        return await Promise.all(leaderboards.map(conv));
    }

    async getStatsForLeaderboard(leaderboardId: number, profileId: number) {

        const allies = await this.prisma.$queryRaw`
        SELECT p2.profile_id, pr.name, pr.country, COUNT(*) as games, COUNT(*) filter (where p.won) as wins
        FROM player as p
        JOIN player as p2 ON p2.match_id = p.match_id AND p2.profile_id != p.profile_id AND p2.team = p.team AND p2.team is not null AND p.team is not null
        JOIN profile as pr ON p2.profile_id = pr.profile_id
        JOIN match as m ON m.match_id = p.match_id
        WHERE p.profile_id=${profileId} AND m.leaderboard_id=${leaderboardId} -- AND p.team != -1
        GROUP BY p2.profile_id, pr.name, pr.country
        ORDER BY games desc
        LIMIT 10;
    `;

        const opponents = await this.prisma.$queryRaw`
        SELECT p2.profile_id, pr.name, pr.country, COUNT(*) as games, COUNT(*) filter (where p.won) as wins
        FROM player as p
        JOIN player as p2 ON p2.match_id = p.match_id AND p2.profile_id != p.profile_id AND p2.team != p.team AND p2.team is not null AND p.team is not null
        JOIN profile as pr ON p2.profile_id = pr.profile_id
        JOIN match as m ON m.match_id = p.match_id
        WHERE p.profile_id=${profileId} AND m.leaderboard_id=${leaderboardId} -- AND p.team != -1
        GROUP BY p2.profile_id, pr.name, pr.country
        ORDER BY games desc
        LIMIT 10;
    `;

        const location = await this.prisma.$queryRaw`
        SELECT location, COUNT(location) as games, COUNT(*) filter (where won) as wins
        FROM player as p
        JOIN match as m ON m.match_id = p.match_id
        WHERE profile_id=${profileId} AND m.leaderboard_id=${leaderboardId}
        GROUP BY location
        ORDER BY games desc;
    `;

        const civ = await this.prisma.$queryRaw`
        SELECT civ, COUNT(civ) as games, COUNT(*) filter (where won) as wins
        FROM player as p
        JOIN match as m ON m.match_id = p.match_id
        WHERE profile_id=${profileId} AND m.leaderboard_id=${leaderboardId}
        GROUP BY civ
        ORDER BY games desc;
    `;

        return {
            civ,
            location,
            allies,
            opponents,
        };
    }
}
