import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {PrismaService} from '../service/prisma.service';
import {chunk, sortBy} from "lodash";
import {retrieveAllAdvertisements, retrieveAllObservableAdvertisements} from "../helper/api-paging";
import {getRecentMatchHistory, IObservableAdvertisement} from "../helper/api";
import {parseAdvertisement, parseObservableAdvertisement} from "../parser/advertisement/advertisement";
import {getCommunityRecentMatchHistory} from "../helper/community-api";
import {parseRecentMatch} from "../parser/relic/recent-match";

@Injectable()
export class DebugTask implements OnApplicationBootstrap {
    private readonly logger = new Logger(DebugTask.name);

    constructor(
        private prisma: PrismaService,
    ) {}

    async onApplicationBootstrap() {
        await this.run();
    }

    async run() {
        // await this.fetchAdvertisements();
        await this.fetchRecentMatches();
        // console.log('Waiting 10s');
        // setTimeout(() => this.run(), 10 * 1000);
    }

    async fetchRecentMatches() {
        console.log();
        console.log('FetchRecentMatches');

        // const [num, matches] = await getRecentMatchHistory([196240]);
        // const match = matches.find(m => m[0] === 181762032);

        // const [num, matches] = await getRecentMatchHistory([209525]);
        // const match = matches.find(m => m[0] === 183053517);
        // const parsedData = parseRecentMatch(match);
        // console.log(parsedData.players);

        // const [num, matches] = await getRecentMatchHistory([209525]);
        // const [num, matches] = await getRecentMatchHistory([196240]); // viper
        // const [num, matches] = await getRecentMatchHistory([506898]); // lierey
        // const [num, matches] = await getRecentMatchHistory([572017]); // themax
        // const [num, matches] = await getRecentMatchHistory([336655]); // baratticus
        // const [num, matches] = await getRecentMatchHistory([223576]); // sihing mo
        // const [num, matches] = await getRecentMatchHistory([223576]); // roger_max



        // const profileId = 10171106;
        // const [num, matches] = await getRecentMatchHistory([profileId]); //
        //
        // let parsedMatchesAll = matches
        //     .map(m => parseRecentMatch(m))
        //     .filter(m => m.finished == null || isAfter(m.finished, parseISO('2022-10-02T17:13:25.000Z')))
        // ;
        // parsedMatchesAll = sortBy(parsedMatchesAll, m => m.finished).reverse();
        // console.log(parsedMatchesAll.map(h => ({ finished: h.finished, leaderboard: h.leaderboard_id })));

        // const leaderboard = await getLeaderBoard2(3, 29040, 50);
        // // console.log(leaderboard);
        //
        // const statGroup = leaderboard.statGroups.find(sg => sg.members.find(m => m.profile_id === profileId));
        // const stat = leaderboard.leaderboardStats.find(s => s.statgroup_id === statGroup.id);
        // console.log(stat);
        // console.log(fromUnixTime(stat.lastmatchdate));



        // const matchPendingItems: Prisma.match_pendingCreateManyInput[] = [5788321].map(profileId => ({
        //     profile_id: profileId,
        //     priority: 0,
        // }));
        //
        // await upsertMany(this.prisma, 'match_pending', ['profile_id'], matchPendingItems);
        // await upsertMany(this.prisma, 'match_pending', ['profile_id'], matchPendingItems, null, ['priority']);

        // const [num, matches1] = await getRecentMatchHistory([196240]);


        // const [num, matches1] = await getRecentMatchHistory([209525]);
        // let parsedMatches = matches1.map(m => parseRecentMatch(m));
        //
        // parsedMatches = sortBy(parsedMatches, m => m.started).reverse();
        // // parsedMatches = parsedMatches.filter((m, i) => i < 5);
        // // parsedMatches = parsedMatches.filter(p => p.name.includes('test pls do not join 9'));
        //
        // // console.log(matches1);
        // console.log(JSON.stringify(parsedMatches.map(p => ({
        //     match_id: p.match_id,
        //     started: p.started,
        //     population: p.population,
        //     location: p.location,
        //     game_variant: p.game_variant,
        // })), null, 2));







        // let [observableAdvertisementsRaw, profilesRaw] = await retrieveAllObservableAdvertisements();
        //
        // const parsedData = observableAdvertisementsRaw.map(parseObservableAdvertisement);
        //
        // console.log(JSON.stringify(parsedData.map(p => ({
        //     id: p.match_id,
        //     internal_leaderboard_id: p.internal_leaderboard_id,
        //     leaderboard_id: p.leaderboard_id,
        // })), null, 2));




        // civ == -1
        //
        // const [num, matches1] = await getRecentMatchHistory([6000519,
        //     10186733,
        //     2146827,
        //     1749802,
        // ]);
        // let parsedMatches = matches1.map(m => parseRecentMatch(m));
        //
        // parsedMatches = sortBy(parsedMatches, m => m.started).reverse();
        // // parsedMatches = parsedMatches.filter((m, i) => i < 5);
        // parsedMatches = parsedMatches.filter(p => p.match_id == 234374607);
        //
        // // console.log(matches1);
        // console.log(JSON.stringify(parsedMatches.map(m => ({
        //     match_id: m.match_id,
        //     name: m.name,
        //     started: m.started,
        //     players: m.players.map(p => ({
        //         id: p.slot + ' ' + p.color + ' ' + p.civ,
        //     })),
        // })), null, 2));


        const [num, matches1] = await getRecentMatchHistory([209525]);
        let parsedMatches = matches1.map(m => parseRecentMatch(m));

        parsedMatches = sortBy(parsedMatches, m => m.started).reverse();
        // parsedMatches = parsedMatches.filter((m, i) => i < 5);
        parsedMatches = parsedMatches.filter(p => p.name.includes('test pls do not join 10'));

        // console.log(matches1);
        console.log(JSON.stringify(parsedMatches.map(m => ({
            match_id: m.match_id,
            name: m.name,
            started: m.started,
            players: m.players.map(p => ({
                id: p.slot + ' ' + p.color + ' ' + p.civ,
            })),
        })), null, 2));


        // let advertisementsRaw = await retrieveAllAdvertisements();
        // const parsedData = advertisementsRaw.map(parseAdvertisement);
        // const currentMatch = parsedData.find(p => p.name === 'test pls do not join 10b');
        //
        // console.log(JSON.stringify(currentMatch.players.map(p => ({
        //     id: p.slot + ' ' + p.civ,
        // })), null, 2));



        // const matches = await getCommunityRecentMatchHistory([209525]); // snibell

        // let [num, matches2] = await getRecentMatchHistory([6769485]); // snibell
        //
        // // const match = matches2.find(m => m[0] === 184982871);
        // // matches2 = matches2.filter(m => m[0] === 184982871);
        //
        // let parsed = [];
        // for (const match of matches2) {
        //     try {
        //         const parsedData = parseRecentMatch(match);
        //         parsed.push(parsedData);
        //     } catch (e) {
        //         console.log(match[0], 'errored');
        //     }
        // }
        //
        // parsed = sortBy(parsed, m => m.started).reverse();
        //
        // console.log(JSON.stringify(parsed, null, 2));
        // console.log('-------------')
        // console.log('-------------')
        // console.log('-------------')
        // console.log('-------------')
        //
        // const dbMatches = await this.prisma.match.findMany({
        //     include: {
        //         players: true,
        //     },
        //     where: {
        //         match_id: { in: parsed.map(m => m.match_id) },
        //     },
        //     orderBy: {
        //         started: 'desc',
        //     },
        // });
        //
        // console.log(JSON.stringify(dbMatches, null, 2));






        // const matches = await getCommunityRecentMatchHistory([196240]);
        // let parsed = matches.matchHistoryStats.map(parseCommunityMatch);

        // const dates = sortBy(parsed, m => m.started).map(m => ({ match_id: m.match_id, started: m.started, finished: m.finished }));
        //
        // console.log(dates);

        // const match = parsed.find(m => m.match_id === 184000803);
        // console.log(match);

        // const matches = await this.prisma.match.findMany({
        //     where: {
        //         players: {
        //             some: {
        //                 profile_id: { in: [10214586] },
        //             },
        //         },
        //     },
        //     include: {
        //         players: {
        //             include: {
        //                 profile: true,
        //             },
        //         },
        //     },
        //     orderBy: {
        //         started: 'desc',
        //     },
        // });


        // const match = parseCommunityMatch(matches.matchHistoryStats[0]);
        // console.log(JSON.stringify(match, null, 4));


        // await getLeaderBoard(3, 1, 200);
        // await getLeaderBoard2(3, 1, 200);

        // const matchesC = await getCommunityRecentMatchHistory([2824801]);
        //
        // const [num, matchesAll] = await getRecentMatchHistory([2824801]);
        // let parsedMatchesAll = matchesAll
        //     .map(m => parseRecentMatch(m))
        //     .filter(m => m.finished == null || isAfter(m.finished, parseISO('2022-10-02T17:13:25.000Z')))
        // ;
        //
        // parsedMatchesAll = sortBy(parsedMatchesAll, m => m.finished).reverse();
        //
        // const matches = parsedMatchesAll.filter(m => m.leaderboard_id === 3);
        //
        // console.log(parsedMatchesAll.length);
        // console.log(matches.length);
        //
        // let historyEntries = await this.prisma.rating.findMany({
        //     where: {
        //         profile_id: 2824801,
        //         // leaderboard_id: 3,
        //     },
        //     orderBy: {
        //         date: 'desc',
        //     },
        // });
        //
        // let games = await this.prisma.match.findMany({
        //     include: {
        //         players: true,
        //     },
        //     where: {
        //         players: { some: { profile_id: 2824801,} },
        //         finished: { gte: parseISO('2022-10-02T17:13:25.000Z') },
        //         // leaderboard_id: 3,
        //     },
        //     orderBy: {
        //         finished: 'desc',
        //     },
        // });
        //
        // // console.log(matches.map(h => h.finished));
        // // console.log(parsedMatchesAll.map(h => h.finished));
        // // console.log(historyEntries.map(h => h.date));
        // console.log(parsedMatchesAll.map(h => ({ finished: h.finished, leaderboard: h.leaderboard_id })));
        // console.log(games.map(h => ({ finished: h.finished, leaderboard: h.leaderboard_id })));
        // console.log(historyEntries.map(h => ({ date: h.date, leaderboard: h.leaderboard_id, rating: h.rating })));





        // const advertisements = await retrieveAllAdvertisements();



        // const [num, matches] = await getRecentMatchHistory([
        //     10710313
        // ]);
        // // const match = matches.find(m => m[0] === 168830700);
        //
        // // time();
        // const parsedData = matches.map(parseRecentMatch);
        // // const parsedData = parseRecentMatch(matches[0]);
        // // time();
        //
        // console.log('match count', matches.length);
        //
        // // console.log(JSON.stringify(parsedData, null, 2));
        // const playerMatches = parsedData.filter(m => m.players.find(p => p.profile_id === 10710313) != null);
        //
        // console.log(playerMatches);
        //
        // // await getLeaderBoard(3, 1, 200);
        // // await getLeaderBoard2(3, 1, 200);
        //
        // // const parsedDatas = sortBy(matches, m => m[0]).reverse().filter((m, i) => i < 5).map(parseRecentMatch);
        // // console.log(parsedDatas.map(m => [m.match_id, m.raw]));
        // // console.log(JSON.stringify(parsedDatas.map(m => [m.match_id, m.raw]), null, 2));
    }

    async fetchAdvertisements() {
        console.log();
        console.log('FetchAdvertisements');
        const advertisements = await retrieveAllAdvertisements();
        await this.parseAdvertisements(advertisements);
    }

    async parseAdvertisements(advertisements: IObservableAdvertisement[]) {
        console.log();
        console.log('ParseAdvertisements');

        advertisements = advertisements.filter(advertisement => advertisement[0] === 182861111);

        const parsed = [];
        for (const advertisementChunk of chunk(advertisements, 10)) {
            for (const advertisement of advertisementChunk) {
                const parsedData = parseAdvertisement(advertisement);
                parsed.push(parsedData);
            }
        }

        const match = parsed[0]; //.find(m => m.match_id === 182853957);
        console.log(JSON.stringify(match, null, 4));
    }
}
