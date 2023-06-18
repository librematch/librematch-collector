// SPDX-License-Identifier: AGPL-3.0-or-later

import { Field, Int, ObjectType, Parent, ResolveField } from '@nestjs/graphql';
import { Profile } from "./profile";


@ObjectType()
export class LeaderboardRow {
    @Field(type => Int)
    leaderboard_id: number;

    @Field(type => Int, { nullable: true })
    profile_id: number;

    @Field(type => Int, { nullable: true })
    rank?: number;

    @Field(type => Int, { nullable: true })
    rating?: number;

    @Field(type => Int, { nullable: true })
    streak?: number;

    @Field(type => Int, { nullable: true })
    wins?: number;

    @Field(type => Int, { nullable: true })
    losses?: number;

    @Field(type => Int, { nullable: true })
    drops?: number;

    @Field(type => Date, { nullable: true })
    last_match_time?: Date;

    @Field(type => Profile)
    profile: Profile;
}

@ObjectType()
export class LeaderboardRowList {
    @Field(type => Int)
    total: number;

    @Field(type => [LeaderboardRow])
    leaderboard_rows: LeaderboardRow[];
}
