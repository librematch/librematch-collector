import {Field, Int, ObjectType, Parent, ResolveField} from '@nestjs/graphql';
import {Player} from "./player";


@ObjectType()
export class Lobby {
    @Field()
    match_id: number;

    @Field()
    name: string;

    @Field(type => Int, {nullable: true})
    leaderboard_id?: number;

    @Field(type => Int, {nullable: true})
    location?: number;

    @Field(type => String, {nullable: true})
    server?: string;

    @Field(type => Int, {nullable: true})
    game_mode?: number;

    @Field(type => Int, {nullable: true})
    speed?: number;

    @Field(type => Int)
    num_players: number;

    @Field(type => Int, {nullable: true})
    replayed?: number;

    @Field(type => Date, {nullable: true})
    started?: Date;

    @Field(type => Date, {nullable: true})
    finished?: Date;

    @Field(type => [Player])
    players: Player[];
}

@ObjectType()
export class LobbyList {
    @Field(type => Int)
    total: number;

    @Field(type => [Lobby])
    lobbies: Lobby[];
}
