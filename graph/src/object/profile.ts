// SPDX-License-Identifier: AGPL-3.0-or-later

import { Field, Int, ObjectType, Parent, ResolveField } from '@nestjs/graphql';

@ObjectType()
export class Profile {
    @Field()
    profile_id: number;

    @Field(type => String, { nullable: true })
    steam_id?: string;

    @Field(type => String, { nullable: true })
    name?: string;

    @Field(type => String, { nullable: true })
    clan?: string;

    @Field(type => String, { nullable: true })
    country?: string;

    @Field(type => String, { nullable: true })
    avatarhash?: string;

    @Field(type => Date, { nullable: true })
    last_match_time?: Date;

    // @Field(type => [LeaderboardRow])
    // leaderboard_rows?: any[];
    // leaderboard_rows?: LeaderboardRow[];
}
