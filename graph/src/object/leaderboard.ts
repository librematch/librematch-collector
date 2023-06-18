// SPDX-License-Identifier: AGPL-3.0-or-later

import { Field, Int, ObjectType, Parent, ResolveField } from '@nestjs/graphql';
import { Player } from "./player";
import { fromUnixTime } from "date-fns";


@ObjectType()
export class Leaderboard {
    @Field(type => Int)
    leaderboard_id: number;

    @Field(type => Int)
    profile_id: number;

    @Field({ nullable: true })
    steam_id?: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    rank?: number;

    @Field({ nullable: true })
    rank_country?: number;

    @Field({ nullable: true })
    country?: string;

    @Field({ nullable: true })
    clan?: string;

    @Field({ nullable: true })
    icon?: string;

    @Field({ nullable: true })
    rating?: number;

    @Field({ nullable: true })
    highest_rating?: number;

    @Field({ nullable: true })
    previous_rating?: number;

    @Field({ nullable: true })
    games?: number;

    @Field({ nullable: true })
    wins?: number;

    @Field({ nullable: true })
    losses?: number;

    @Field({ nullable: true })
    drops?: number;

    @Field({ nullable: true })
    streak?: number;

    @Field({ nullable: true })
    lowest_streak?: number;

    @Field({ nullable: true })
    highest_streak?: number;

    @Field({ nullable: true })
    last_match?: number;

    @Field({ nullable: true })
    last_match_time?: Date;
}
