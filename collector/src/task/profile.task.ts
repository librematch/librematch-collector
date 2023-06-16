import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {PrismaService} from '../service/prisma.service';
import {Prisma} from '@prisma/client'
import {chunk} from "lodash";
import {upsertMany} from "../helper/db";
import {getProfileName, proxySteamUserRequest} from "../helper/api";
import {subDays} from "date-fns";
import {sleep} from "../helper/util";
import {parseProfile} from "../parser/profile";
import {sendMetric} from "../helper/metric-api";
import {InjectSentry, SentryService} from "@ntegral/nestjs-sentry";

@Injectable()
export class ProfileTask implements OnApplicationBootstrap {
    private readonly logger = new Logger(ProfileTask.name);

    metricProfilesUpdated = 0;

    constructor(
        private prisma: PrismaService,
        @InjectSentry() private readonly sentryService: SentryService,
    ) {}

    async onApplicationBootstrap() {
        setTimeout(() => this.run(), 500);
        setInterval(() => this.sendMetrics(), 60 * 1000);
    }

    async sendMetrics() {
        sendMetric(`profiles_updated`, this.metricProfilesUpdated);
        this.metricProfilesUpdated = 0;
    }

    async run() {
        try {
            await this.refresh();
            setTimeout(() => this.run());
        } catch (e) {
            console.error(e);
            this.sentryService.instance().captureException(e);
            console.log('Restart importer in 60s');
            setTimeout(() => this.run(), 60 * 1000);
        }
    }

    async refresh() {
        await this.refreshProfilesWithoutName();
        await this.refreshProfilesWithSteamId();
    }

    async refreshProfilesWithoutName() {
        console.log();
        console.log('RefreshProfilesWithoutName');

        const profiles = await this.prisma.profile.findMany({
            where: {
                profile_id: { not: -1 },
                name: null,
                OR: [
                    { last_refresh: null },
                    { last_refresh: { lt: subDays(new Date(), 7) } },
                ],
            },
            take: 1000,
        });

        console.log('profiles to be refreshed', profiles.length);
        console.log('profiles to be refreshed', profiles.map(p => p.profile_id));

        for (const profileChunk of chunk(profiles, 50)) {
            const profileItems: Prisma.profileCreateManyInput[] = [];

            const [num, profileNames] = await getProfileName(profileChunk.map(p => p.profile_id));
            console.log(profileNames.length);

            for (const profileName of profileNames) {
                if (profileName == null) continue; // TODO: Mark Profile as errored
                const parsedData = parseProfile(profileName);
                profileItems.push({
                    ...parsedData,
                    last_refresh: new Date(),
                });
            }

            // Use insert here to prevent deadlock
            await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);

            this.metricProfilesUpdated += profileItems.length;

            console.log(new Date(), 'Waiting 10s');
            await sleep(10000);
        }

        console.log(new Date(), 'Waiting 60s');
        await sleep(60 * 1000);
    }


    async refreshProfilesWithSteamId() {
        console.log();
        console.log('RefreshProfilesWithSteamId');

        const profiles = await this.prisma.profile.findMany({
            where: {
                steam_id: { not: null },
                last_match_time: { gt: subDays(new Date(), 7) },
                OR: [
                    { last_refresh: null },
                    { last_refresh: { lt: subDays(new Date(), 7) } },
                ],
            },
            take: 1000,
        });

        console.log('profiles to be refreshed', profiles.length);

        for (const profileChunk of chunk(profiles, 10)) {
            const profileItems: Prisma.profileCreateManyInput[] = [];

            // Wont return 10 results sometimes because e.g. user with steam id like 2535406079288194
            // wont be returned

            const profileNames = profileChunk.map(p => `/steam/${p.steam_id}`);
            console.log(profileNames);
            const response = await proxySteamUserRequest(profileNames);
            // console.log(response);
            // console.log(JSON.stringify(response, null, 2));
            // break;

            for (const dbProfile of profileChunk) {
                const avatar = response?.avatars?.find(a => a.profile_id === dbProfile.profile_id);
                const steamPlayer = response?.steamResults?.response?.players?.find(a => a.steamid === dbProfile.steam_id);
                profileItems.push({
                    profile_id: dbProfile.profile_id,
                    ...(avatar?.alias && { name: avatar?.alias }),
                    ...(avatar?.country && { country: avatar?.country }),
                    ...(steamPlayer?.avatarhash && { avatarhash: steamPlayer?.avatarhash }),
                    last_refresh: new Date(),
                });
            }

            // Use insert here to prevent deadlock
            await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);

            this.metricProfilesUpdated += profileItems.length;

            console.log(new Date(), 'Waiting 5s');
            await sleep(5000);
        }

        console.log(new Date(), 'Waiting 5s');
        await sleep(5000);
    }
}
