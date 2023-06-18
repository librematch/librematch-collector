// SPDX-License-Identifier: AGPL-3.0-or-later

import { Field, Int, ObjectType, Parent, ResolveField } from '@nestjs/graphql';
import { Player } from "./player";


@ObjectType()
export class Dummy {
    @Field()
    match_id: number;
}

@ObjectType()
export class Match {
    @Field()
    match_id: number;

    @Field()
    name: string;

    @Field(type => Int, { nullable: true })
    leaderboard_id?: number;

    @Field(type => Int, { nullable: true })
    location?: number;

    @Field(type => Int, { nullable: true })
    speed?: number;

    @Field(type => Int)
    num_players: number;

    @Field(type => Int, { nullable: true })
    replayed?: number;

    @Field(type => Date)
    started: Date;

    @Field(type => Date, { nullable: true })
    finished?: Date;

    @Field(type => [Player])
    players: Player[];
}

@ObjectType()
export class MatchList {
    @Field(type => Int)
    total: number;

    @Field(type => [Match])
    matches: Match[];
}
