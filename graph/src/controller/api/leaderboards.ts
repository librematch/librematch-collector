// SPDX-License-Identifier: AGPL-3.0-or-later

import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'
import { sendResponse } from "../../helper/util";
import { getTranslation } from "../../../../collector/src/helper/translation";
import { getLeaderboardEnumFromId, leaderboards } from "../../helper/leaderboards";
import { PrismaService } from "../../service/prisma.service";

class ProfileSingleDto extends createZodDto(z.object({
    profile_id: z.string().regex(/^\d+$/).transform(Number),
})) { }


@Controller()
export class LeaderboardController {

    constructor(
        protected prisma: PrismaService,
    ) {

    }

    @Get('/api/leaderboards')
    async leaderboards(
        @Request() req,
        @Response() res,
    ) {
        const language = 'en';
        const conv = row => ({
            leaderboardId: getLeaderboardEnumFromId(row.leaderboardId),
            leaderboardName: getTranslation(language, 'leaderboard', row.leaderboardId),
            abbreviation: row.abbreviation,
        });

        sendResponse(res, leaderboards.map(conv));
    }

}
