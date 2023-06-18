// SPDX-License-Identifier: AGPL-3.0-or-later

import { CACHE_MANAGER, Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../service/prisma.service';
import { chunk, cloneDeep, flatten, isEqual, meanBy, sortBy, sumBy, uniq, uniqBy } from "lodash";
import { retrieveAllAdvertisements } from "../helper/api-paging";
import { getProfileName, IObservableAdvertisement, patchApiConfig } from "../helper/api";
import { parseAdvertisement } from "../parser/advertisement/advertisement";
import { PUB_SUB } from "../../../graph/src/modules/redis.module";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { Cache } from 'cache-manager';
import { sleep } from "../helper/util";
import { sendMetric } from "../helper/metric-api";
import { Prisma } from "@prisma/client";
import { parseProfile } from "../parser/profile";
import { upsertMany } from "../helper/db";
import { InjectSentry, SentryService } from "@ntegral/nestjs-sentry";
import { IParsedGenericMatch, IParsedGenericPlayer } from "../parser/match";
import { getPlayerBackgroundColor, parseIntNullable } from "../../../graph/src/helper/util";
import { putKv, putMessage } from "../helper/kv-api";
import { Camelized, camelizeKeys } from "humps";
import { getTranslation } from "../helper/translation";
import { getCivImage } from "../../../graph/src/helper/civs";
import { getStatusEnumFromId } from "../../../graph/src/helper/enums";
import { getLeaderboardEnumFromId } from "../../../graph/src/helper/leaderboards";
import { getMapEnumFromId, getMapImage } from "../../../graph/src/helper/maps";
import { RedisService } from "../../../graph/src/service/redis.service";
import {
    getBlockedSlotCount,
    getDiffEvents, getDiffEventsAddRemove,
    getLobbyPlayerName,
    getTotalSlotCount
} from "../../../graph/src/helper/event";

export const CACHE_LOBBIES = 'lobbies';
export const PUBSUB_LOBBIES = 'lobbies';
export const STREAM_LOBBIES = 'stream-lobbies';


export interface ILobbiesMatch {
    totalSlotCount: number;
    blockedSlotCount: number;
    gameModeName: string;
    averageRating: number;

    matchId: number
    started: Date
    finished?: Date
    leaderboardId?: number
    leaderboardName?: string
    name: string
    server?: string
    internalLeaderboardId?: number
    difficulty: number
    startingAge: number
    fullTechTree: boolean
    allowCheats: boolean
    empireWarsMode: boolean
    endingAge: number
    gameMode: number
    lockSpeed: boolean
    lockTeams: boolean
    mapSize: number
    map: number
    mapName: string
    mapImageUrl: string
    population: number
    recordGame: boolean
    regicideMode: boolean
    resources: number
    sharedExploration: boolean
    speed: number
    suddenDeathMode: boolean
    teamPositions: boolean
    teamTogether: boolean
    treatyLength: number
    turboMode: boolean
    victory: number
    revealMap: number
    privacy: number
    players: IMatchesMatchPlayer2[];
}

export interface IMatchesMatchPlayer2 {
    matchId: number
    profileId: number
    name?: string
    rating?: number
    ratingDiff?: number
    games?: number
    wins?: number
    losses?: number
    drops?: number
    civ: number
    civName: string
    civImageUrl: string
    color: number
    colorHex: string
    slot: number
    team?: number
    won?: boolean
}

interface ILobbyAddedEvent {
    type: 'lobbyAdded';
    data: ILobbiesMatch;
}

interface ILobbyUpdatedEvent {
    type: 'lobbyUpdated';
    data: ILobbiesMatch;
}

interface ILobbyRemovedEvent {
    type: 'lobbyRemoved';
    data: { matchId: number; };
}

interface ISlotAddedEvent {
    type: 'slotAdded';
    data: IMatchesMatchPlayer2;
}

interface ISlotUpdatedEvent {
    type: 'slotUpdated';
    data: IMatchesMatchPlayer2;
}

interface ISlotRemovedEvent {
    type: 'slotRemoved';
    data: { matchId: number; slot: number; };
}

const eventMappingLobby = {
    'added': 'lobbyAdded',
    'updated': 'lobbyUpdated',
    'removed': 'lobbyRemoved',
};

const eventMappingPlayer = {
    'added': 'slotAdded',
    'updated': 'slotUpdated',
    'removed': 'slotRemoved',
};

const eventMappingOrder = {
    'lobbyAdded': 0,
    'lobbyUpdated': 1,
    'slotAdded': 2,
    'slotUpdated': 3,
    'slotRemoved': 4,
    'lobbyRemoved': 5,
};

type ILobbyEvent =
    ILobbyAddedEvent
    | ILobbyUpdatedEvent
    | ILobbyRemovedEvent
    | ISlotAddedEvent
    | ISlotUpdatedEvent
    | ISlotRemovedEvent;

@Injectable()
export class LobbyTask implements OnApplicationBootstrap {
    private readonly logger = new Logger(LobbyTask.name);

    metricLobbies = 0;

    constructor(
        private prisma: PrismaService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
        @Inject(CACHE_MANAGER) private cache: Cache,
        @InjectSentry() private readonly sentryService: SentryService,
        private redis: RedisService,
    ) {
    }

    async onApplicationBootstrap() {
        setTimeout(() => this.importLobbies(), 500);
        // setInterval(() => this.sendMetrics(), 60 * 1000);
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
        sendMetric(`lobbies`, this.metricLobbies);
        this.metricLobbies = 0;
    }

    async importLobbies() {
        try {
            const count = await this.importData();
            if (count < 100) {
                console.log('Waiting 30s');
                setTimeout(() => this.importLobbies(), 10 * 1000);
            } else {
                console.log('Waiting 0s');
                setTimeout(() => this.importLobbies(), 0);
            }
        } catch (e) {
            console.error(e);
            this.sentryService.instance().captureException(e);
            console.log('Restart importer in 60s');
            setTimeout(() => this.importLobbies(), 60 * 1000);
        }
    }

    async importData() {
        await this.fetchAdvertisements();
        return 50;
    }

    async fetchAdvertisements() {
        console.log();
        console.log('FetchAdvertisements');

        let advertisementsRaw = await retrieveAllAdvertisements();

        // advertisementsRaw = advertisementsRaw.filter(a => a[0] === 184628929);
        // console.log(JSON.stringify(advertisementsRaw));

        let advertisements = await this.parseAdvertisements(advertisementsRaw);

        // advertisements = advertisements.filter(a => a.name.includes('towerdefender'));
        // advertisements = advertisements.filter(a => a.name.includes('test pls'));
        // console.log(JSON.stringify(advertisements));

        const profileIds = uniq(flatten(advertisements.map(a => a.players.filter(p => p.profile_id > 0).map(p => p.profile_id))));

        const existingProfiles = await this.prisma.profile.findMany({
            where: {
                profile_id: { in: profileIds },
            },
            take: 1000,
        });

        const notExistingOrUnnamedProfileIds = profileIds.filter(p =>
            !existingProfiles.find(e => e.profile_id === p) ||
            existingProfiles.find(e => e.profile_id === p && !e.name)
        );

        await this.fetchProfiles(notExistingOrUnnamedProfileIds);

        let revivedLobbies = (await this.reviveLobbies(advertisements)).map(x => camelizeKeys<IParsedGenericMatch>(x));

        // revivedLobbies = revivedLobbies.filter(l => l.name.includes('test pls'));

        await this.pushLobbies(cloneDeep(revivedLobbies));

        this.metricLobbies = advertisements.length;
    }

    lastLobbiesDict: Record<string, Camelized<IParsedGenericMatch>> = {};
    lastPlayersDict: Record<string, Camelized<IParsedGenericPlayer>> = {};

    async pushLobbies(lobbies: Camelized<IParsedGenericMatch>[]) {
        let players = flatten(lobbies.map(l => l.players.map(p => ({ ...p, matchId: l.matchId }))));

        const getLobbyKey = (lobby: Camelized<IParsedGenericMatch>) => `${lobby.matchId}`;
        const parseLobbyKey = (key: string) => ({ matchId: parseInt(key) });

        const getSlotKey = (player: IMatchesMatchPlayer2) => `${player.matchId}-${player.slot}`;
        const parseSlotKey = (key: string) => ({
            matchId: parseInt(key.split('-')[0]),
            slot: parseInt(key.split('-')[1])
        });

        lobbies.forEach(l => delete l.players);

        let newLobbiesDict = Object.assign({}, ...lobbies.map((x) => ({ [getLobbyKey(x as any)]: x }))) as Record<string, Camelized<IParsedGenericMatch>>;
        let newPlayersDict = Object.assign({}, ...players.map((x) => ({ [getSlotKey(x as any)]: x }))) as Record<string, Camelized<IParsedGenericPlayer>>;

        let streamEventId = '0-0';

        if (this.lastLobbiesDict) {
            const diffLobbies = getDiffEvents(this.lastLobbiesDict, newLobbiesDict, eventMappingLobby, parseLobbyKey);
            const diffPlayers = getDiffEvents(this.lastPlayersDict, newPlayersDict, eventMappingPlayer, parseSlotKey);

            // console.log(diffLobbies);
            // console.log(diffPlayers);

            const events = sortBy([...diffLobbies, ...diffPlayers], event => eventMappingOrder[event.type]);

            streamEventId = await this.redis.redis.xadd(
                STREAM_LOBBIES, 'MAXLEN', '10', '*', 'data', JSON.stringify(events)
            );
        }

        const diffLobbies = getDiffEvents({}, newLobbiesDict, eventMappingLobby, parseLobbyKey);
        const diffPlayers = getDiffEvents({}, newPlayersDict, eventMappingPlayer, parseSlotKey);

        const events = sortBy([...diffLobbies, ...diffPlayers], event => eventMappingOrder[event.type]);

        await this.cache.set(CACHE_LOBBIES, { streamEventId, events }, { ttl: 200 * 60 });
        // await putKv(CACHE_LOBBIES, {streamEventId, events});

        this.lastLobbiesDict = cloneDeep(newLobbiesDict);
        this.lastPlayersDict = cloneDeep(newPlayersDict);

        return streamEventId;
    }

    async reviveLobbies(matches: IParsedGenericMatch[]) {
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

    async fetchProfiles(profileIds: number[]) {
        for (const profileChunk of chunk(profileIds, 50)) {
            const profileItems: Prisma.profileCreateManyInput[] = [];

            const [num, profileNames] = await getProfileName(profileChunk);
            console.log(profileNames.length);

            for (const profileName of profileNames) {
                const parsedData = parseProfile(profileName);
                profileItems.push({
                    ...parsedData,
                    last_refresh: new Date(),
                });
            }

            await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);

            console.log(new Date(), 'Waiting 0.5s');
            await sleep(0.5 * 1000);
        }
    }

    async parseAdvertisements(advertisements: IObservableAdvertisement[]) {
        console.log();
        console.log('ParseAdvertisements');

        const parsed: IParsedGenericMatch[] = [];

        for (const advertisementChunk of chunk(advertisements, 10)) {
            for (const advertisement of advertisementChunk) {
                const parsedData = parseAdvertisement(advertisement);
                parsed.push(parsedData);
            }
        }

        const uniqueLobbies = uniqBy(parsed, p => p.match_id);

        console.log(`Got ${advertisements.length} lobbies`);
        console.log(`Got ${uniqueLobbies.length} unique lobbies`);
        return uniqueLobbies;
    }
}
