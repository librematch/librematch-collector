import {Injectable} from '@nestjs/common';
import {sendResponse} from "../../helper/util";
import {PrismaService} from "../../service/prisma.service";


@Injectable()
export class ProfileService {

    constructor(
        protected prisma: PrismaService,
    ) {

    }

    async getProfiles(props: { search?: string, start?: number, count?: number, profileId?: number, steamId?: string }) {
        const {
            search,
            start,
            count,
            profileId,
            steamId
        } = props;

        let profiles = [];
        if (search != null) {
            profiles = await this.prisma.$queryRaw`
                SELECT p.profile_id, p.name, country, SUM(wins+losses) as games
                FROM profile as p
                LEFT JOIN leaderboard_row lr on p.profile_id = lr.profile_id
                WHERE p.name ILIKE ${search}
                GROUP BY p.profile_id
                ORDER BY SUM(wins+losses) desc NULLS LAST
                OFFSET ${start - 1}
                LIMIT ${count}
            `;
        } else if (profileId != null) {
            profiles = await this.prisma.$queryRaw`
                SELECT p.profile_id, p.name, country, SUM(wins+losses) as games
                FROM profile as p
                LEFT JOIN leaderboard_row lr on p.profile_id = lr.profile_id
                WHERE p.profile_id = ${profileId}
                GROUP BY p.profile_id
                ORDER BY SUM(wins+losses) desc NULLS LAST
                OFFSET ${start - 1}
                LIMIT ${count}
            `;
        } else if (steamId != null) {
            profiles = await this.prisma.$queryRaw`
                SELECT p.profile_id, p.name, country, SUM(wins+losses) as games
                FROM profile as p
                LEFT JOIN leaderboard_row lr on p.profile_id = lr.profile_id
                WHERE p.steam_id = ${steamId}
                GROUP BY p.profile_id
                ORDER BY SUM(wins+losses) desc NULLS LAST
                OFFSET ${start - 1}
                LIMIT ${count}
            `;
        }
        return profiles;
    }
}
