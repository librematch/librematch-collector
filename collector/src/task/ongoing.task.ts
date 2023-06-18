// SPDX-License-Identifier: AGPL-3.0-or-later

import { CACHE_MANAGER, Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../service/prisma.service';
import { Prisma } from '@prisma/client'
import { chunk, cloneDeep, flatten, meanBy, sortBy, sumBy, uniq, uniqBy } from "lodash";
import { retrieveAllObservableAdvertisements } from "../helper/api-paging";
import { upsertMany } from "../helper/db";
import { IObservableAdvertisement, IProfile, patchApiConfig } from "../helper/api";
import { parseObservableAdvertisement } from "../parser/advertisement/advertisement";
import { parseProfile } from "../parser/profile";
import { isAfter, subMinutes } from "date-fns";
import { PUB_SUB } from "../../../graph/src/modules/redis.module";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { sendMetric } from "../helper/metric-api";
import fetch from "node-fetch";
import { Cache } from "cache-manager";
import { InjectSentry, SentryService } from "@ntegral/nestjs-sentry";
import { IParsedGenericMatch, IParsedGenericPlayer } from "../parser/match";
import { getPlayerBackgroundColor, parseIntNullable } from "../../../graph/src/helper/util";
import { Camelized, camelizeKeys } from "humps";
import {
    getBlockedSlotCount,
    getDiffEvents,
    getDiffEventsAddRemove,
    getLobbyPlayerName,
    getTotalSlotCount
} from "../../../graph/src/helper/event";
import { getTranslation } from "../helper/translation";
import { getCivImage } from "../../../graph/src/helper/civs";
import { getStatusEnumFromId } from "../../../graph/src/helper/enums";
import { getLeaderboardEnumFromId } from "../../../graph/src/helper/leaderboards";
import { getMapEnumFromId, getMapImage } from "../../../graph/src/helper/maps";
import { CACHE_LOBBIES, IMatchesMatchPlayer2, STREAM_LOBBIES } from "./lobby.task";
import { RedisService } from "../../../graph/src/service/redis.service";
import { putKv } from "../helper/kv-api";

export const CACHE_ONGOING_MATCHES = 'ongoing-matches';
export const PUBSUB_ONGOING_MATCHES = 'ongoing-matches';
export const STREAM_ONGOING_MATCHES = 'stream-ongoing-matches';

export const PUBSUB_MATCH_STARTED = 'pubsub-match-started';

const eventMappingMatch = {
    'added': 'matchAdded',
    'updated': 'matchUpdated',
    'removed': 'matchRemoved',
};

const eventMappingOrder = {
    'matchAdded': 0,
    'matchUpdated': 1,
    'matchRemoved': 5,
};

@Injectable()
export class OngoingTask implements OnApplicationBootstrap {
    private readonly logger = new Logger(OngoingTask.name);

    metricOngoingMatches = 0;

    constructor(
        private prisma: PrismaService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
        @Inject(CACHE_MANAGER) private cache: Cache,
        @InjectSentry() private readonly sentryService: SentryService,
        private redis: RedisService,
    ) {
    }

    async onApplicationBootstrap() {
        setTimeout(() => this.importMatches(), 500);
        setInterval(() => this.sendMetrics(), 60 * 1000);
        await this.updateSettings();
        setInterval(() => this.updateSettings(), 60 * 1000);
    }

    async updateSettings() {
        const settings = (await this.prisma.setting.findMany({ where: { component: 'global' } }));
        patchApiConfig({
            appBinaryChecksum: parseIntNullable(settings.find(s => s.key === 'appBinaryChecksum')?.value),
        });
    }

    async sendMetrics() {
        sendMetric(`ongoing_matches`, this.metricOngoingMatches);
        this.metricOngoingMatches = 0;

        try {
            const response = await fetch('https://steamplayercount.com/api/813780', { timeout: 60 * 1000 });
            const values = await response.json();
            await sendMetric(`online_players`, values[values.length - 1][1]);
        } catch (e) {
        }
    }

    async importMatches() {
        try {
            const count = await this.importData();
            if (count < 100) {
                console.log('Waiting 30s');
                setTimeout(() => this.importMatches(), 30 * 1000);
            } else {
                console.log('Waiting 0s');
                setTimeout(() => this.importMatches(), 0);
            }
        } catch (e) {
            console.error(e);
            this.sentryService.instance().captureException(e);
            console.log('Restart importer in 60s');
            setTimeout(() => this.importMatches(), 60 * 1000);
        }
    }

    async importData() {
        await this.fetchObservableAdvertisements();
        return 50;
    }

    private lastObservableMatches = [];
    private lastObservableMatchesBacklog = [];

    async fetchObservableAdvertisements() {
        console.log();
        console.log('FetchObservableAdvertisements');

        let [observableAdvertisementsRaw, profilesRaw] = await retrieveAllObservableAdvertisements();

        const observableAdvertisements = await this.parseObservableAdvertisements(observableAdvertisementsRaw);

        let revivedMatches = (await this.reviveMatches(observableAdvertisements)).map(x => camelizeKeys<IParsedGenericMatch>(x));

        await this.pushOngoingMatches(cloneDeep(revivedMatches));

        // await this.cache.set(CACHE_ONGOING_MATCHES, observableAdvertisements, {ttl: 200 * 60});
        // await this.pubSub.publish(PUBSUB_ONGOING_MATCHES, observableAdvertisements);

        let observableMatchesNew = observableAdvertisements
            .filter(obs => !this.lastObservableMatches.find(o => o.match_id === obs.match_id));

        let observableMatchesNewBacklog = this.lastObservableMatches
            .filter(obs => !observableAdvertisements.find(o => o.match_id === obs.match_id));

        this.lastObservableMatches = observableAdvertisements;

        console.log(`New     ${observableMatchesNew.length} matches`);
        console.log(observableMatchesNew.map(o => o.match_id));

        console.log(`Backlog New ${observableMatchesNewBacklog.length} matches`);
        console.log(observableMatchesNewBacklog.map(o => o.match_id));

        this.lastObservableMatchesBacklog.unshift(...observableMatchesNewBacklog);
        this.lastObservableMatchesBacklog = uniqBy(this.lastObservableMatchesBacklog, item => item.match_id);

        await this.fetchRecentMatches(this.lastObservableMatchesBacklog);

        this.lastObservableMatchesBacklog = [];

        await this.parseProfiles(profilesRaw);

        this.metricOngoingMatches = observableAdvertisements.length;
    }

    lastOngoingMatchesDict: Record<string, Camelized<IParsedGenericMatch>> = {};

    async pushOngoingMatches(lobbies: Camelized<IParsedGenericMatch>[]) {
        const getMatchKey = (lobby: Camelized<IParsedGenericMatch>) => `${lobby.matchId}`;
        const parseMatchKey = (key: string) => ({ matchId: parseInt(key) });

        let newOngoingMatchesDict = Object.assign({}, ...lobbies.map((x) => ({ [getMatchKey(x as any)]: x }))) as Record<string, Camelized<IParsedGenericMatch>>;

        let streamEventId = '0-0';

        if (this.lastOngoingMatchesDict) {
            const diffOngoingMatches = getDiffEventsAddRemove(this.lastOngoingMatchesDict, newOngoingMatchesDict, eventMappingMatch, parseMatchKey);

            // console.log(diffOngoingMatches);

            const events = sortBy(diffOngoingMatches, event => eventMappingOrder[event.type]);

            streamEventId = await this.redis.redis.xadd(
                STREAM_ONGOING_MATCHES, 'MAXLEN', '10', '*', 'data', JSON.stringify(events)
            );
        }

        const diffLobbies = getDiffEventsAddRemove({}, newOngoingMatchesDict, eventMappingMatch, parseMatchKey);

        const events = sortBy(diffLobbies, event => eventMappingOrder[event.type]);

        await this.cache.set(CACHE_ONGOING_MATCHES, { streamEventId, events }, { ttl: 200 * 60 });
        // await putKv(CACHE_ONGOING_MATCHES, {streamEventId, events});

        this.lastOngoingMatchesDict = cloneDeep(newOngoingMatchesDict);

        return streamEventId;
    }

    async reviveMatches(matches: IParsedGenericMatch[]) {
        const language = 'en';

        const profiles = await this.prisma.profile.findMany({
            include: {
                leaderboard_row: true,
            },
            where: {
                profile_id: { in: flatten(matches.map(a => a.players.map(p => p.profile_id))) },
            },
        });

        const conv = (match: IParsedGenericMatch) => {
            const players = match.players.map((p: any) => {
                const profile = profiles.find(profile => profile.profile_id === p.profile_id);
                return ({
                    ...p,
                    rating: profile?.leaderboard_row?.find(l => l.leaderboard_id === match.leaderboard_id)?.rating,
                    civName: p.civ ? getTranslation(language, 'civ', p.civ) : null,
                    civImageUrl: p.civ ? getCivImage(p.civ) : null,
                    color: p.color,
                    colorHex: getPlayerBackgroundColor(p.color),
                    status: getStatusEnumFromId(p.status),
                    name: getLobbyPlayerName(p) || profile?.name,
                    games: sumBy(profile.leaderboard_row, l => l.wins + l.losses),
                    wins: sumBy(profile.leaderboard_row, l => l.wins),
                    losses: sumBy(profile.leaderboard_row, l => l.losses),
                    drops: sumBy(profile.leaderboard_row, l => l.drops),
                    country: profile?.country,
                });
            });
            return {
                ...match,
                leaderboardId: getLeaderboardEnumFromId(match.leaderboard_id),
                leaderboardName: getTranslation(language, 'leaderboard', match.leaderboard_id),
                map: getMapEnumFromId(match.location),
                mapName: getTranslation(language, 'map_type', match.location),
                mapImageUrl: getMapImage(match.location),
                averageRating: meanBy(players.filter((p: any) => p.rating), (p: any) => p.rating),
                gameMode: getMapEnumFromId(match.game_mode),
                gameModeName: getTranslation(language, 'game_type', match.game_mode),
                totalSlotCount: getTotalSlotCount(match),
                blockedSlotCount: getBlockedSlotCount(match),
                players,
            }
        };

        matches = matches.map(conv);

        return matches;
    }

    async fetchRecentMatches(pendingMatches: IParsedGenericMatch[]) {
        console.log();
        console.log('FetchRecentMatches');

        let matchPendingItems: Prisma.match_pendingCreateManyInput[] = pendingMatches.map(match => ({
            profile_id: match.players.map(p => p.profile_id).filter(id => id !== -1)[0],
            priority: 100,
        }));

        matchPendingItems = uniqBy(matchPendingItems, item => item.profile_id);

        await upsertMany(this.prisma, 'match_pending', ['profile_id'], matchPendingItems);

        console.log(`Queued ${matchPendingItems.length} matches for fetching with priority 100`);

        return [];
    }

    async parseObservableAdvertisements(observableAdvertisements: IObservableAdvertisement[]) {
        console.log();
        console.log('ParseObservableAdvertisements');

        const parsed: IParsedGenericMatch[] = [];

        for (const observableAdvertisementChunk of chunk(observableAdvertisements, 10)) {
            let matchItems: Prisma.matchCreateManyInput[] = [];
            let playerItems: Prisma.playerCreateManyInput[] = [];

            for (const observableAdvertisement of observableAdvertisementChunk) {
                const parsedData = parseObservableAdvertisement(observableAdvertisement);
                parsed.push(parsedData);

                const { players, ...matchData } = parsedData;

                if (this.lastObservableMatches.find(o => o.match_id === parsedData.match_id)) continue;

                matchItems.push({
                    ...matchData,
                    finished: null,
                });

                players.forEach(parsedPlayerData => {
                    playerItems.push({
                        match_id: parsedData.match_id,
                        ...parsedPlayerData,
                    });
                });
            }

            const uniqueProfileIds = uniq(playerItems.map(player => player.profile_id));
            const profileItems = uniqueProfileIds.map(profileId => ({ profile_id: profileId }));

            const existingMatches = await this.prisma.match.findMany({
                where: {
                    match_id: { in: matchItems.map(m => m.match_id) },
                },
            });

            matchItems = matchItems.filter(m => !existingMatches.find(em => em.match_id === m.match_id));
            playerItems = playerItems.filter(p => !existingMatches.find(em => em.match_id === p.match_id));

            await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
            await upsertMany(this.prisma, 'match', ['match_id'], matchItems);
            await upsertMany(this.prisma, 'player', ['match_id', 'profile_id', 'slot'], playerItems);

            const matchesStarted = await this.prisma.match.findMany({
                include: {
                    players: {
                        include: {
                            profile: true,
                        }
                    },
                },
                where: {
                    match_id: { in: matchItems.map(m => m.match_id) },
                    started: { gt: new Date(Date.now() - 1000 * 60 * 5) },
                },
                orderBy: {
                    started: 'asc',
                },
            });

            if (matchesStarted.length > 0) {
                console.log('PUBSUB matches started', matchesStarted.length);
                await this.pubSub.publish(PUBSUB_MATCH_STARTED,
                    matchesStarted,
                );
            }
        }

        console.log(`Inserted ${observableAdvertisements.length} matches`);
        return parsed;
    }

    async parseProfiles(profiles: IProfile[]) {
        console.log();
        console.log('ParseProfiles');

        const parsed = [];

        for (const profileChunk of chunk(profiles, 10)) {
            const profileItems: Prisma.profileCreateManyInput[] = [];

            for (const profile of profileChunk) {
                const parsedData = parseProfile(profile);
                parsed.push(parsedData);
                profileItems.push(parsedData);
            }

            await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
        }

        console.log(`Inserted ${profiles.length} profiles`);
        return parsed;
    }
}
