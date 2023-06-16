import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {PrismaService} from '../service/prisma.service';
import { Prisma } from '@prisma/client'
import {uniq, chunk, uniqBy} from "lodash";
import {
    retrieveAllAdvertisements,
    retrieveAllLeaderBoardBlocks,
    retrieveAllObservableAdvertisements
} from "../helper/api-paging";
import {upsertMany} from "../helper/db";
import {getMatchesFromAoe2Companion, getProfileName, getRecentMatchHistory, proxySteamUserRequest} from "../helper/api";

@Injectable()
export class ImportTask {
    private readonly logger = new Logger(ImportTask.name);

    constructor(
        // private connection: Connection,
        private prisma: PrismaService,
    ) {}

    // async onApplicationBootstrap() {
    //     setTimeout(() => this.importMatches(), 500);
    // }
    //
    // async importMatches() {
    //     try {
    //         const count = await this.importData();
    //         // if (count < 100) {
    //         //     console.log('Waiting 30s');
    //         //     setTimeout(() => this.importMatches(), 30 * 1000);
    //         // } else {
    //         //     console.log('Waiting 0s');
    //         //     setTimeout(() => this.importMatches(), 0);
    //         // }
    //     } catch (e) {
    //         console.error(e);
    //         console.log('Restart importer in 60s');
    //         setTimeout(() => this.importMatches(), 60 * 1000);
    //     }
    // }
    //
    // async importData() {
    //     // await this.fetchFromAoe2Companion();
    //     // await this.fetchLeaderboard();
    //     // await this.fetchAdvertisements();
    //     await this.fetchProfiles();
    //     // await this.fetchObservableAdvertisements();
    //     // await this.fetchRecentMatches();
    //
    //     return 50;
    // }
    //
    // // lastObservableAdvertisements: IObservableAdvertisement[];
    //
    // async fetchFromAoe2Companion() {
    //     console.log();
    //     console.log('FetchFromAoe2Companion');
    //
    //     let cursor = '141356286';
    //     const count = 10000;
    //
    //     let total = 0;
    //
    //     while(true) {
    //         const start = new Date();
    //         const {next_cursor, matches} = await getMatchesFromAoe2Companion(cursor, count);
    //         total += matches.length;
    //
    //         for (const matchesChunk of chunk(matches, 100)) {
    //             let matchItems: Prisma.smaller_matchCreateManyInput[] = [];
    //             let playerItems: Prisma.smaller_playerCreateManyInput[] = [];
    //             let profileItems: Prisma.smaller_profileCreateManyInput[] = [];
    //
    //             for (const {players, ...match} of matchesChunk) {
    //                 delete match.match_uuid;
    //                 delete match.lobby_id;
    //                 delete match.opened;
    //                 delete match.replayed;
    //                 delete match.duration;
    //                 delete match.duration_minutes;
    //                 delete match.notified;
    //                 delete match.maybe_finished;
    //                 delete match.checked;
    //
    //                 matchItems.push({
    //                     ...match,
    //                     match_id: parseInt(match.match_id),
    //                 });
    //
    //                 players.forEach(playerData => {
    //                     playerItems.push({
    //                         match_id: parseInt(playerData.match_id),
    //                         profile_id: playerData.profile_id,
    //                         slot: playerData.slot,
    //                         civ: playerData.civ,
    //                         team: playerData.team,
    //                         color: playerData.color,
    //                         won: playerData.won,
    //                     });
    //                 });
    //
    //                 players.forEach(playerData => {
    //                     profileItems.push({
    //                         profile_id: playerData.profile_id,
    //                         steam_id: playerData.steam_id,
    //                         name: playerData.name,
    //                         clan: playerData.clan,
    //                         last_match_time: match.started,
    //                     });
    //                 });
    //             }
    //
    //             // Because we are fetching multiple matches there might be duplicate profiles
    //             profileItems = uniqBy(profileItems, item => item.profile_id);
    //
    //             await upsertMany(this.prisma, 'smaller_profile', ['profile_id'], profileItems);
    //             await upsertMany(this.prisma, 'smaller_match', ['match_id'], matchItems);
    //             await upsertMany(this.prisma, 'smaller_player', ['match_id', 'profile_id', 'slot'], playerItems);
    //         }
    //
    //         cursor = next_cursor;
    //
    //         console.log('total', total, 'percent', total/16000000*100, 'time', (new Date().getTime() - start.getTime()) / 1000, 's');
    //
    //         if (!next_cursor) break;
    //     }
    // }
    //
    // async fetchLeaderboard() {
    //     console.log();
    //     console.log('FetchLeaderboard');
    //
    //     const leaderboard_id = 3;
    //     const leaderboardEntries = await retrieveAllLeaderBoardBlocks(leaderboard_id);
    //
    //     let i = 1;
    //     for (const chunkRows of chunk(leaderboardEntries, 10)) {
    //         const items = chunkRows.map(leaderboardEntriesChunk => ({
    //             leaderboard_id,
    //             start: i += 200,
    //             json: {raw: leaderboardEntriesChunk},
    //             updated_at: new Date(),
    //         } as Prisma.raw_leaderboard_blockCreateManyInput));
    //
    //         await upsertMany(this.prisma, 'raw_leaderboard_block', ['leaderboard_id', 'start'], items);
    //     }
    // }
    //
    // async fetchAdvertisements() {
    //     console.log();
    //     console.log('FetchAdvertisements');
    //
    //     const advertisements = await retrieveAllAdvertisements();
    //
    //     let items = advertisements.map(observableAdvertisement => {
    //         return ({
    //             match_id: observableAdvertisement[0],
    //             json: {raw: observableAdvertisement},
    //             updated_at: new Date(),
    //         } as Prisma.raw_observable_advertisementCreateManyInput);
    //     });
    //
    //     // Because we are fetching multiple pages there might be duplicate entries
    //     items = uniqBy(items, item => item.match_id);
    //
    //     await upsertMany(this.prisma, 'raw_advertisement', ['match_id'], items);
    //     console.log(`Upserted ${items.length} raw_advertisement`);
    //
    //     const result = await this.prisma.raw_advertisement.deleteMany({
    //         where: {
    //             match_id: { notIn: items.map(i => i.match_id) },
    //         },
    //     });
    //     console.log(`Deleted ${result.count} raw_advertisement`);
    // }
    //
    // async fetchObservableAdvertisements() {
    //     console.log();
    //     console.log('FetchObservableAdvertisements');
    //
    //     const [observableAdvertisements, profiles] = await retrieveAllObservableAdvertisements();
    //
    //     let observableAdvertisementsToInsert = observableAdvertisements.map(observableAdvertisement => {
    //         return ({
    //             match_id: observableAdvertisement[0],
    //             json: {raw: observableAdvertisement},
    //             updated_at: new Date(),
    //         } as Prisma.raw_observable_advertisementCreateManyInput);
    //     });
    //
    //     // Because we are fetching multiple pages there might be duplicate entries
    //     observableAdvertisementsToInsert = uniqBy(observableAdvertisementsToInsert, item => item.match_id);
    //
    //     await upsertMany(this.prisma, 'raw_observable_advertisement', ['match_id'], observableAdvertisementsToInsert);
    //     console.log(`Upserted ${observableAdvertisementsToInsert.length} raw_observable_advertisement`);
    //
    //     // Move old advertisements to backlog
    //     let observableAdvertisementsInDb = await this.prisma.raw_observable_advertisement.findMany({
    //         orderBy: {updated_at: 'asc'},
    //     });
    //
    //     let obsToMove = observableAdvertisementsInDb
    //         .filter(obs => !observableAdvertisements.find(o => o[0] === obs.match_id));
    //
    //     const inserted = await upsertMany(this.prisma, 'raw_observable_advertisement_backlog', ['match_id'], obsToMove);
    //     console.log(`Inserted ${inserted ?? 0} raw_observable_advertisement_backlog`);
    //
    //     const result = await this.prisma.raw_observable_advertisement.deleteMany({
    //         where: {
    //             match_id: { in : obsToMove.map(o => o.match_id) },
    //         },
    //     });
    //     console.log(`Deleted ${result.count} raw_observable_advertisement`);
    //
    //
    //     let profilesToInsert = profiles.map(profile => {
    //         return ({
    //             profile_id: profile[1],
    //             json: {raw: profile},
    //             updated_at: new Date(),
    //         } as Prisma.raw_profileCreateManyInput);
    //     });
    //
    //     // Because we are fetching multiple pages there might be duplicate entries
    //     profilesToInsert = uniqBy(profilesToInsert, item => item.profile_id);
    //
    //     await upsertMany(this.prisma, 'raw_profile', ['profile_id'], profilesToInsert);
    //     console.log(`Upserted ${profilesToInsert.length} raw_profile`);
    // }
    //
    // async fetchRecentMatches() {
    //     console.log();
    //     console.log('FetchRecentMatches');
    //
    //     let pendingMatches = await this.prisma.pending_match.findMany({
    //         orderBy: {updated_at: 'asc'},
    //         // where: { match_id: 144027051 },
    //         // take: 1,
    //     });
    //
    //     const matchesToInsert = [];
    //     for (const pendingMatch of pendingMatches) {
    //         const profileIds = (pendingMatch.profile_ids as any).raw.filter(id => id !== -1);
    //         const [num, matches] = await getRecentMatchHistory([profileIds[0]]);
    //         const match = matches.find(m => m[0] === pendingMatch.match_id);
    //
    //         if (match) {
    //             matchesToInsert.push(match);
    //         } else {
    //             await upsertMany(this.prisma, 'pending_match2', ['match_id'], [pendingMatch]);
    //             await this.prisma.pending_match.deleteMany({
    //                 where: {
    //                     match_id: pendingMatch.match_id,
    //                 },
    //             });
    //             console.log(`pending match not found in recent player ${profileIds[0]} matches. match id ${pendingMatch.match_id}`);
    //             // throw new Error(`pending match not found in recent player ${profileIds[0]} matches. match id ${pendingMatch.match_id}`);
    //         }
    //     }
    //
    //     let items = matchesToInsert.map(match => {
    //         return ({
    //             match_id: match[0],
    //             json: {raw: match},
    //             updated_at: new Date(),
    //         } as Prisma.raw_recent_matchCreateManyInput);
    //     });
    //
    //     await upsertMany(this.prisma, 'raw_recent_match', ['match_id'], items);
    //     console.log(`Upserted ${items.length} raw_recent_match`);
    //
    //     const result = await this.prisma.pending_match.deleteMany({
    //         where: {
    //             match_id: { in : items.map(o => o.match_id) },
    //         },
    //     });
    //     console.log(`Deleted ${result.count} pending_match`);
    // }
    //
    // async fetchProfiles() {
    //     console.log();
    //     console.log('FetchProfiles');
    //
    //     let pendingProfiles = await this.prisma.pending_profile.findMany({
    //         orderBy: {updated_at: 'asc'},
    //         // where: { match_id: 144027051 },
    //         take: 2,
    //     });
    //
    //     const profileIds = pendingProfiles.map(pendingProfile => pendingProfile.profile_id);
    //     const [num, profiles] = await getProfileName(profileIds);
    //
    //     console.log(profiles);
    //
    //     let rawProfilesToInsert = profiles.map(profile => {
    //         return ({
    //             profile_id: profile[1],
    //             json: {raw: profile},
    //             updated_at: new Date(),
    //         } as Prisma.raw_profileCreateManyInput);
    //     });
    //
    //     await upsertMany(this.prisma, 'raw_profile', ['profile_id'], rawProfilesToInsert);
    //     console.log(`Upserted ${rawProfilesToInsert.length} raw_profile`);
    //
    //     const profileNames = profiles.map(profile => profile[2]);
    //     const result = await proxySteamUserRequest(profileNames);
    //
    //     const steamProfiles = (result as any).steamResults.response.players;
    //
    //     console.log(steamProfiles);
    //
    //     let rawSteamProfilesToInsert = steamProfiles.map(profile => {
    //         return ({
    //             profile_id: profiles.find(p => p[2].includes(profile.steamid))[1],
    //             json: {raw: profile},
    //             updated_at: new Date(),
    //         } as Prisma.raw_profileCreateManyInput);
    //     });
    //
    //     await upsertMany(this.prisma, 'raw_steam_profile', ['profile_id'], rawSteamProfilesToInsert);
    //     console.log(`Upserted ${rawSteamProfilesToInsert.length} raw_steam_profile`);
    // }
}
