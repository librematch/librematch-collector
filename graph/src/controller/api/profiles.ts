// SPDX-License-Identifier: AGPL-3.0-or-later

import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'
import { sendResponse } from "../../helper/util";
import { PrismaService } from "../../service/prisma.service";
import { getParam } from "../legacy.controller";
import { ProfileService } from "../service/profile.service";
import { ReferenceService } from "../service/reference.service";

class ProfileSingleDto extends createZodDto(z.object({
    profile_id: z.string().regex(/^\d+$/).transform(Number),
})) { }

const PER_PAGE = 20;


@Controller()
export class ProfileController {

    constructor(
        protected prisma: PrismaService,
        protected profileService: ProfileService,
        protected referenceService: ReferenceService,
    ) {

    }

    @Get('/api/profiles')
    async profiles(
        @Request() req,
        @Response() res,
    ) {
        const page = parseInt(getParam(req.query, 'page') ?? '1');
        const steamId = getParam(req.query, 'steam_id') || null;
        const profileId = parseInt(getParam(req.query, 'profile_id')) || null;
        let search = getParam(req.query, 'search') || null;

        const start = (page - 1) * PER_PAGE + 1;
        const count = PER_PAGE;

        if (search) {
            search = `%${search}%`;
        }

        let profiles = await this.profileService.getProfiles({ search, start, count, profileId, steamId });

        profiles = profiles.map(p => {
            return {
                ...p,
                verified: this.referenceService?.referencePlayersDict?.[p.profile_id] != null,
            }
        });

        sendResponse(res, {
            start: start,
            count: count,
            profiles,
        });
    }
}
