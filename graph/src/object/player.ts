// SPDX-License-Identifier: AGPL-3.0-or-later

import { Field, Int, ObjectType, Parent, ResolveField } from '@nestjs/graphql';
import { Profile } from "./profile";

@ObjectType()
export class Player {
    @Field()
    match_id: string;

    @Field(type => Int)
    profile_id: number;

    @Field(type => Int, { nullable: true })
    civ?: number;

    @Field(type => Int)
    slot: number;

    @Field(type => Int, { nullable: true })
    team?: number;

    @Field(type => Int, { nullable: true })
    color?: number;

    @Field({ nullable: true })
    won?: boolean;

    @Field(type => Profile)
    profile: Profile;
}
