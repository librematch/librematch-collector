import {Controller, Get, Request, Response, UseGuards} from '@nestjs/common';
import {createZodDto} from 'nestjs-zod'
import {z} from 'nestjs-zod/z'
import {sendResponse} from "../../helper/util";
import {getTranslation} from "../../../../collector/src/helper/translation";
import {PrismaService} from "../../service/prisma.service";
import {getParam} from "../legacy.controller";
import {maps} from 'graph/src/helper/maps';

class ProfileSingleDto extends createZodDto(z.object({
    profile_id: z.string().regex(/^\d+$/).transform(Number),
})) {}


@Controller()
export class MapController {

    constructor(
        protected prisma: PrismaService,
    ) {

    }

    @Get('/api/maps')
    async maps(
        @Request() req,
        @Response() res,
    ) {
        const language = getParam(req.query, 'language') ?? 'en';

        const conv = row => {
            row.name = getTranslation(language, 'map_type', row.mapId);
            row.imageUrl = `https://aoe2companion.com/maps/${row.file}.png`;
            return row;
        };

        sendResponse(res, [...maps].map(conv));
    }
}
