import {Field, Int, ObjectType, Parent, ResolveField} from '@nestjs/graphql';
import {Player} from "./player";
import {fromUnixTime} from "date-fns";


@ObjectType()
export class Stats {
    @Field(type => Int)
    leaderboard_id: number;

    @Field(type => [StatsEntry])
    civ: StatsEntry[];

    @Field(type => [StatsEntry])
    location: StatsEntry[];

    @Field(type => [StatsEntry])
    allies: StatsEntry[];

    @Field(type => [StatsEntry])
    opponents: StatsEntry[];
}

@ObjectType()
export class StatsEntry {
    @Field(type => Int, {nullable: true})
    civ?: number;

    @Field(type => Int, {nullable: true})
    location?: number;

    @Field(type => Int, {nullable: true})
    profile_id?: number;

    @Field({nullable: true})
    name?: string;

    @Field({nullable: true})
    country?: string;

    @Field(type => Int)
    games: number;

    @Field(type => Int)
    wins: number;
}
