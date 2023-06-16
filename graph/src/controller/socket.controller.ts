import {CACHE_MANAGER, Controller, Get, Inject, Req, Response} from '@nestjs/common';
import {sendResponse} from "../helper/util";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import {Server} from 'ws';
import {Cache} from "cache-manager";
import {RedisService} from "../service/redis.service";
import {CACHE_LOBBIES, STREAM_LOBBIES} from "../../../collector/src/task/lobby.task";
import {CACHE_ONGOING_MATCHES, STREAM_ONGOING_MATCHES} from "../../../collector/src/task/ongoing.task";
import {sleep} from "../../../collector/src/helper/util";
import {chunk} from "lodash";

@Controller()
export class SocketController {

    // constructor(
    //     @Inject(CACHE_MANAGER) private cache: Cache,
    //     private redis: RedisService,
    // ) {
    //
    // }

    @Get('/ready')
    async ready(@Req() req, @Response() res) {
        sendResponse(res, 'Ready.');
    }

    // @Get('/readytest')
    // async readytest(@Req() req, @Response() res) {
    //     const kk = await this.cache.get('temp');
    //     sendResponse(res, kk);
    // }
    //
    // @Get('/readytest2')
    // async readytest2(@Req() req, @Response() res) {
    //     const kk = await this.redis.redis.get('temp');
    //     sendResponse(res, kk);
    // }
}

enum READY_STATE {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3,
}

@WebSocketGateway({ path: '/listen' })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // @SubscribeMessage('events')
    // onEvent(client: any, data: any): Observable<WsResponse<number>> {
    //     console.log('onEvent', client, data);
    //     return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
    // }

    afterInit(server: any): any {
        console.log('afterInit');
    }

    async handleConnection(socket: WebSocket, ...args: any[]): Promise<any> {
        const _redis = new RedisService();
        try {
            console.log('handleConnection', args[0].url);

            const incomingMessage = args[0];
            const url = new URL('http://localhost' + incomingMessage.url);
            const { searchParams } = url;

            const handler = searchParams.get('handler');

            if (handler === 'match-started' || handler === 'match-finished') {
                return this.handlePubSub(socket, handler, _redis);
            }

            let cache, stream;
            if (handler === 'lobbies') {
                cache = CACHE_LOBBIES;
                stream = STREAM_LOBBIES;
            }
            if (handler === 'ongoing-matches') {
                cache = CACHE_ONGOING_MATCHES;
                stream = STREAM_ONGOING_MATCHES;
            }

            // let {streamEventId, events} = JSON.parse(await _redis.redis.get(cache));

            const start = new Date();
            let {streamEventId, events} = JSON.parse(await _redis.redis.get(cache));
            console.log(new Date().getTime() - start.getTime(), 'ms');

            if (socket.readyState === READY_STATE.OPEN) {
                socket.send(JSON.stringify(events));
            }
            console.log(new Date().getTime() - start.getTime(), 'ms');

            while (socket.readyState === READY_STATE.OPEN) {
                console.log('read');
                const results = await _redis.redis.xread('BLOCK', 5000, 'STREAMS', stream, streamEventId)
                if (results) {
                    const [key, messages] = results[0];
                    streamEventId = messages[messages.length - 1][0];
                    const values = messages.map(([id, fields]) => fields[1]);
                    for (const value of values) {
                        if (socket.readyState === READY_STATE.OPEN) {
                            console.log('send for', stream);
                            // socket.send(value);

                            const parsed = JSON.parse(value);
                            for (const events of chunk(parsed, 10)) {
                                socket.send(JSON.stringify(events));
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    handleDisconnect(socket: any): any {
        console.log('handleDisconnect');
    }

    async handlePubSub(socket: WebSocket, handler: string, _redis: RedisService) {
        const channel = 'pubsub-' + handler;

        _redis.redis.subscribe(channel, (err, count) => {
            if (err) {
                console.error("Failed to subscribe: %s", err.message);
            } else {
                console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
            }
        });

        _redis.redis.on("message", (channel, message) => {
            console.log(`Received ${message} from ${channel}`);
            socket.send(message);
        });
    }
}