import {Inject, Injectable, Logger} from '@nestjs/common';
import {PrismaService} from '../service/prisma.service';
import {PUB_SUB} from "../../../graph/src/modules/redis.module";
import {RedisPubSub} from "graphql-redis-subscriptions";

@Injectable()
export class ParseService {
    private readonly logger = new Logger(ParseService.name);

    constructor(
        private prisma: PrismaService,
        @Inject(PUB_SUB) private pubSub: RedisPubSub,
    ) {
    }

    // async onApplicationBootstrap() {
    //     setTimeout(() => this.importMatches(), 3000 + 500);
    // }
    //
    // async importMatches() {
    //     try {
    //         const count = await this.parseData();
    //         // if (count < 100) {
    //         console.log('Waiting 30s');
    //         setTimeout(() => this.importMatches(), 30 * 1000);
    //         // } else {
    //         //     console.log('Waiting 0s');
    //         //     setTimeout(() => this.importMatches(), 0);
    //         // }
    //     } catch (e) {
    //         console.error(e);
    //         // setTimeout(() => this.importMatches(), 60 * 1000);
    //     }
    // }
    //
    // async parseData() {
    //     await this.parseAdvertisements();
    //     // await this.parseProfiles();
    //     // await this.parseSteamProfiles();
    //     // await this.parseObservableAdvertisements();
    //     // await this.parseObservableAdvertisementsBacklog();
    //     // await this.parseRecentMatches();
    //     // await this.parseLeaderboardRows();
    //
    //     // let matches = await this.prisma.match.findMany({
    //     //     include: {
    //     //         players: true,
    //     //     },
    //     //     orderBy: {match_id: 'asc'},
    //     //     // where: { match_id: 144065112 },
    //     //     take: 5,
    //     // });
    //     //
    //     // for (const match of matches) {
    //     //     await this.pubSub.publish('match',
    //     //         match,
    //     //     );
    //     // }
    // }
    //
    // async parseLeaderboardRows() {
    //     console.log();
    //     console.log('ParseLeaderboardRows');
    //
    //     let leaderboardRowBlocks = await this.prisma.raw_leaderboard_block.findMany({
    //         orderBy: {updated_at: 'asc'},
    //     });
    //
    //     for (const leaderboardRowBlock of leaderboardRowBlocks) {
    //         let leaderboardRowItems: Prisma.leaderboard_rowCreateManyInput[] = [];
    //         let profileItems: Prisma.profileCreateManyInput[] = [];
    //
    //         const parsedLeaderboardRows = parseLeaderboardRowBlock((leaderboardRowBlock.json as any).raw);
    //         for (const parsedLeaderboardRow of parsedLeaderboardRows) {
    //             leaderboardRowItems.push({
    //                 leaderboard_id: leaderboardRowBlock.leaderboard_id,
    //                 profile_id: parsedLeaderboardRow.profile_id,
    //                 name: parsedLeaderboardRow.name,
    //                 rating: parsedLeaderboardRow.rating,
    //                 rank: parsedLeaderboardRow.rank,
    //                 streak: parsedLeaderboardRow.streak,
    //                 wins: parsedLeaderboardRow.wins,
    //                 losses: parsedLeaderboardRow.losses,
    //                 drops: parsedLeaderboardRow.drops,
    //                 last_match_time: parsedLeaderboardRow.last_match_time,
    //             });
    //
    //             profileItems.push({
    //                 profile_id: parsedLeaderboardRow.profile_id,
    //                 name: parsedLeaderboardRow.name,
    //                 last_match_time: parsedLeaderboardRow.last_match_time,
    //             });
    //         }
    //
    //         await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems,
    //             Prisma.sql`WHERE profile.last_match_time is null OR profile.last_match_time < excluded.last_match_time`);
    //         await upsertMany(this.prisma, 'leaderboard_row', ['leaderboard_id', 'profile_id'], leaderboardRowItems);
    //     }
    //
    //     return 50;
    // }
    //
    // async parseAdvertisements() {
    //     console.log();
    //     console.log('ParseAdvertisements');
    //
    //     let advertisements = await this.prisma.raw_advertisement.findMany({
    //         orderBy: {updated_at: 'asc'},
    //         // where: { match_id: 144027051 },
    //         // take: 20,
    //     });
    //
    //     const parsed = [];
    //
    //     for (const advertisementChunk of chunk(advertisements, 10)) {
    //         const matchItems: Prisma.matchCreateManyInput[] = [];
    //         const playerItems: Prisma.playerCreateManyInput[] = [];
    //
    //         for (const advertisement of advertisementChunk) {
    //             const parsedData = parseAdvertisement((advertisement.json as any).raw);
    //             parsed.push(advertisement.match_id);
    //
    //             const {players, ...matchData} = parsedData;
    //
    //             matchItems.push({
    //                 ...matchData,
    //                 finished: null,
    //             });
    //
    //             players.forEach(parsedPlayerData => {
    //                 delete parsedPlayerData.won;
    //                 playerItems.push({
    //                     match_id: parsedData.match_id,
    //                     ...parsedPlayerData,
    //                 });
    //             });
    //         }
    //
    //         const uniqueProfileIds = uniq(playerItems.map(player => player.profile_id));
    //         const profileItems = uniqueProfileIds.map(profileId => ({profile_id: profileId}));
    //
    //         await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
    //         await upsertMany(this.prisma, 'lobby', ['match_id'], matchItems);
    //         await upsertMany(this.prisma, 'lobby_player', ['match_id', 'profile_id', 'slot'], playerItems);
    //
    //         const pendingProfileItems = uniqueProfileIds.map(profileId => ({profile_id: profileId, updated_at: new Date()}));
    //         await upsertMany(this.prisma, 'pending_profile', ['profile_id'], pendingProfileItems);
    //     }
    //     console.log(`Inserted ${advertisements.length} lobbies`);
    //
    //     const result = await this.prisma.lobby.deleteMany({
    //         where: {
    //             match_id: { notIn: advertisements.map(i => i.match_id) },
    //         },
    //     });
    //     console.log(`Deleted ${result.count} lobbies`);
    //
    //     return 50;
    // }
    //
    // async parseProfiles() {
    //     console.log();
    //     console.log('ParseProfiles');
    //
    //     let profiles = await this.prisma.raw_profile.findMany({
    //         orderBy: {updated_at: 'asc'},
    //         // where: { match_id: 144027051 },
    //         // take: 20,
    //     });
    //
    //     const parsed = [];
    //
    //     for (const profileChunk of chunk(profiles, 10)) {
    //         const profileItems: Prisma.profileCreateManyInput[] = [];
    //
    //         for (const profile of profileChunk) {
    //             const parsedData = parseProfile((profile.json as any).raw);
    //             parsed.push(profile.profile_id);
    //             profileItems.push(parsedData);
    //         }
    //
    //         await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
    //     }
    //
    //     console.log(`Inserted ${profiles.length} profiles`);
    //     return profiles.length;
    // }
    //
    // async parseSteamProfiles() {
    //     console.log();
    //     console.log('ParseSteamProfiles');
    //
    //     let profiles = await this.prisma.raw_steam_profile.findMany({
    //         orderBy: {updated_at: 'asc'},
    //         // where: { match_id: 144027051 },
    //         // take: 20,
    //     });
    //
    //     const parsed = [];
    //
    //     // for (const profileChunk of chunk(profiles, 10)) {
    //     //     const profileItems: Prisma.profileCreateManyInput[] = [];
    //     //
    //     //     for (const profile of profileChunk) {
    //     //         const parsedData = parseProfile((profile.json as any).raw);
    //     //         parsed.push(profile.profile_id);
    //     //         profileItems.push(parsedData);
    //     //     }
    //     //
    //     //     await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
    //     // }
    //     //
    //     // console.log(`Inserted ${profiles.length} profiles`);
    //     return profiles.length;
    // }
    //
    //
    // async parseObservableAdvertisementsBacklog() {
    //     console.log();
    //     console.log('ParseObservableAdvertisementsBacklog');
    //
    //     let observableAdvertisements = await this.prisma.raw_observable_advertisement_backlog.findMany({
    //         orderBy: {updated_at: 'asc'},
    //         // where: { match_id: 144027051 },
    //         // take: 20,
    //     });
    //
    //     const failedToParseIds: number[] = [];
    //     const failedToPersistIds: number[] = [];
    //     const parsedIds: number[] = [];
    //     const persistedIds: number[] = [];
    //
    //     for (const observableAdvertisementChunk of chunk(observableAdvertisements, 10)) {
    //         const matchItems: Prisma.matchCreateManyInput[] = [];
    //         const playerItems: Prisma.playerCreateManyInput[] = [];
    //
    //         const pendingMatchItems: Prisma.pending_matchCreateManyInput[] = [];
    //
    //         for (const observableAdvertisement of observableAdvertisementChunk) {
    //             try {
    //                 const parsedData = parseAdvertisement((observableAdvertisement.json as any).raw);
    //
    //                 const {players, ...matchData} = parsedData;
    //
    //                 matchItems.push({
    //                     ...matchData,
    //                     finished: null,
    //                 });
    //
    //                 pendingMatchItems.push({
    //                     match_id: matchData.match_id,
    //                     profile_ids: {raw: players.map(p => p.profile_id)},
    //                     updated_at: new Date(),
    //                 });
    //
    //                 players.forEach(parsedPlayerData => {
    //                     playerItems.push({
    //                         match_id: parsedData.match_id,
    //                         ...parsedPlayerData,
    //                     });
    //                 });
    //                 parsedIds.push(observableAdvertisement.match_id);
    //             } catch (e) {
    //                 failedToParseIds.push(observableAdvertisement.match_id);
    //             }
    //         }
    //
    //         try {
    //             const uniqueProfileIds = uniq(playerItems.map(player => player.profile_id));
    //             const profileItems = uniqueProfileIds.map(profileId => ({profile_id: profileId}));
    //
    //             await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
    //             await upsertMany(this.prisma, 'match', ['match_id'], matchItems);
    //             await upsertMany(this.prisma, 'player', ['match_id', 'profile_id', 'slot'], playerItems);
    //
    //             await upsertMany(this.prisma, 'pending_match', ['match_id'], pendingMatchItems);
    //
    //             persistedIds.push(...matchItems.map(m => m.match_id));
    //         } catch (e) {
    //             failedToPersistIds.push(...observableAdvertisementChunk.map(ch => ch.match_id));
    //         }
    //     }
    //
    //     console.log(`Parsed ${parsedIds.length} - Persisted ${persistedIds.length} - Failed ${failedToParseIds.length + failedToPersistIds.length}`);
    //
    //     await this.prisma.raw_observable_advertisement_backlog.updateMany({
    //         data: {
    //             error: 'parse',
    //             error_at: new Date(),
    //         },
    //         where: {
    //             match_id: {in: failedToParseIds},
    //         },
    //     });
    //     await this.prisma.raw_observable_advertisement_backlog.updateMany({
    //         data: {
    //             error: 'persist',
    //             error_at: new Date(),
    //         },
    //         where: {
    //             match_id: {in: failedToPersistIds},
    //         },
    //     });
    //     await this.prisma.raw_observable_advertisement_backlog.deleteMany({
    //         where: {
    //             match_id: {in: persistedIds},
    //         },
    //     });
    //
    //     console.log(`Inserted ${observableAdvertisements.length} matches`);
    //     console.log(`Deleted ${observableAdvertisements.length} raw_observable_advertisement_backlog`);
    //     return observableAdvertisements.length;
    // }
    //
    // async parseRecentMatches() {
    //     console.log();
    //     console.log('ParseRecentMatches');
    //
    //     let matches = await this.prisma.raw_recent_match.findMany({
    //         orderBy: {updated_at: 'asc'},
    //         // where: { match_id: 144027051 },
    //         // take: 20,
    //     });
    //
    //     const parsed = [];
    //
    //     for (const matchChunk of chunk(matches, 10)) {
    //         const matchItems: Prisma.matchCreateManyInput[] = [];
    //         const playerItems: Prisma.playerCreateManyInput[] = [];
    //
    //         for (const match of matchChunk) {
    //             const parsedData = parseRecentMatch((match.json as any).raw);
    //             parsed.push(match.match_id);
    //
    //             const {players, ...matchData} = parsedData;
    //
    //             matchItems.push({
    //                 ...matchData,
    //             });
    //
    //             players.forEach(parsedPlayerData => {
    //                 playerItems.push({
    //                     match_id: parsedData.match_id,
    //                     ...parsedPlayerData,
    //                 });
    //             });
    //         }
    //
    //         const uniqueProfileIds = uniq(playerItems.map(player => player.profile_id));
    //         const profileItems = uniqueProfileIds.map(profileId => ({profile_id: profileId}));
    //
    //         await upsertMany(this.prisma, 'profile', ['profile_id'], profileItems);
    //         await upsertMany(this.prisma, 'match', ['match_id'], matchItems);
    //         await upsertMany(this.prisma, 'player', ['match_id', 'profile_id', 'slot'], playerItems);
    //
    //         await this.prisma.raw_recent_match.deleteMany({
    //             where: {
    //                 match_id: {in: matchItems.map(o => o.match_id)},
    //             },
    //         });
    //     }
    //
    //     console.log(`Inserted ${matches.length} matches`);
    //     console.log(`Deleted ${matches.length} raw_recent_match`);
    //
    //     return matches.length;
    // }
}
