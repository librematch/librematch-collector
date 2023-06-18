// SPDX-License-Identifier: AGPL-3.0-or-later

import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RatingHistory {
    @Field(type => Int)
    leaderboard_id: number;

    @Field(type => Int)
    profile_id: number;

    @Field(type => [RatingHistoryEntry])
    history: RatingHistoryEntry[];
}

@ObjectType()
export class RatingHistoryEntry {
    @Field(type => Int)
    rating: number;

    @Field(type => Int)
    num_wins: number;

    @Field(type => Int)
    num_losses: number;

    @Field(type => Int)
    streak: number;

    @Field(type => Int)
    drops: number;

    @Field()
    timestamp: Date;
}
