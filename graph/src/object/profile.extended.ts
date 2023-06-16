import {Field, Int, ObjectType, Parent, ResolveField} from '@nestjs/graphql';
import {Leaderboard} from "./leaderboard";
import {RatingHistory} from "./rating_history";
import {Stats} from "./stats";

@ObjectType()
export class ProfileExtended {
    @Field(type => Int)
    profile_id: number;

    @Field()
    name: string;

    @Field({nullable: true})
    country?: string;

    @Field()
    last_match_time: Date;

    @Field(type => Int, {nullable: true})
    games?: number;

    @Field(type => Int, {nullable: true})
    drops?: number;

    @Field(type => [Leaderboard])
    leaderboards: Leaderboard[];

    @Field(type => [RatingHistory])
    rating_history: RatingHistory[];

    @Field(type => [Stats])
    stats: Stats[];
}
