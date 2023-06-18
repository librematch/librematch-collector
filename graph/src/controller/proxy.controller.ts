// SPDX-License-Identifier: AGPL-3.0-or-later

import { Controller, Get, Logger, OnApplicationBootstrap, Param, Req, Response } from '@nestjs/common';
import SteamUser from "steam-user";
import { generateAuthCode } from "steam-totp";
import fetch from "node-fetch";
import { Request } from 'express';
import { makeQueryString } from "../../../collector/src/helper/util";
import { Response as Res } from 'express';
import { sendMetric } from "../../../collector/src/helper/metric-api";

export interface ISteamSecrets {
    shared_secret: string
    serial_number: string
    revocation_code: string
    uri: string
    server_time: string
    account_name: string
    token_gid: string
    identity_secret: string
    secret_1: string
    status: number
    phone_number_hint: string
}

interface IAppTicket {
    ticket: string;
    lastUpdate?: Date;
}

interface IRelicSession {
    sessionId: string;
    lastUpdate?: Date;
}

const APPID = [813780, "age2"] as const;

@Controller()
export class ProxyController implements OnApplicationBootstrap {
    private readonly logger = new Logger(ProxyController.name);

    steamAccountName = process.env.PROXY_STEAM_ACCOUNT_NAME;
    steamPassword = process.env.PROXY_STEAM_PASSWORD;
    apiKey = process.env.PROXY_API_KEY;
    steamSecrets: ISteamSecrets;
    appTicket: IAppTicket;
    relicSession: IRelicSession;

    steamClient = new SteamUser();

    metricRequests = 0;

    constructor() {
        let buff = Buffer.from(process.env.PROXY_STEAM_SECRETS, 'base64');
        this.steamSecrets = JSON.parse(buff.toString('ascii'));

        console.log(this.steamSecrets);
        console.log(this.apiKey);
    }

    async onApplicationBootstrap() {
        if (!this.steamAccountName) {
            console.log('No steam account name provided');
        }
        if (!this.steamPassword) {
            console.log('No steam password provided');
        }

        this.steamClient.once("disconnected", async (err) => {
            console.log(`SteamClient Disconnected`, err);
        });
        this.steamClient.once("loggedOn", async (details) => {
            console.log(`SteamClient LoggedOn`, details);
        });
        this.steamClient.once("error", async (err) => {
            console.log(`SteamClient Error`);
            console.log(err);
            console.log(`SteamClient Retry in 5min`);
            setTimeout(() => this.steamLogin(), 5 * 60 * 1000);
        });

        await this.steamLogin();
        await this.updateToken();
        setInterval(() => this.updateToken(), 10 * 1000);

        setInterval(() => this.sendMetrics(), 60 * 1000);
        // await this.sendMetrics();
    }

    async sendMetrics() {
        try {
            const serviceName = process.env.SERVICE_NAME.replace(/-/g, '_');
            sendMetric(`${serviceName}_requests`, this.metricRequests);
            this.metricRequests = 0;
        } catch (e) { }
    }

    @Get('/ready')
    async ready(@Req() req, @Response() res) {
        if (this.appTicket == null || this.relicSession == null) {
            return res.send('Initializing...');
        }
        res.send('Ready.');
    }

    async updateToken() {
        await this.getEncodedTicket();
        await this.relicLogin();
        // await sleep(10 * 1000);
    }

    /*
        async def update_token(self):
        while True:
            try:
                await self.get_encoded_ticket()
                await self.relic_login()
                await asyncio.sleep(10)
            except (TicketError, LoginError):
                # Wait 5 seconds and try again
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                # Break from loop if we get cancelled
                return
    * */

    async getEncodedTicket() {
        // if we don't have a ticket or if it's older than 45 minutes, renew it:
        if (this.appTicket == null || new Date().getTime() > this.appTicket.lastUpdate.getTime() + 2700 * 1000) {
            try {
                console.log("[App Ticket] Refreshing app ticket");

                const appTicketResponse = await this.steamClient.getEncryptedAppTicket(
                    APPID[0],
                    Buffer.from("RLINK"),
                );

                console.log(appTicketResponse);
                const based = appTicketResponse.encryptedAppTicket.toString('base64');
                console.log(based);

                this.appTicket = {
                    ticket: based,
                    lastUpdate: new Date(),
                };

                console.log("[App Ticket] Refreshed app ticket");
            } catch (e) {
                console.log('[App Ticket] Error');
                console.log(e);
            }
        }
    }

    async relicLogin() {
        // if we don't have a session or if it's older than 3 minutes renew it:
        if (this.relicSession == null || new Date().getTime() > this.relicSession.lastUpdate.getTime() + 200 * 1000) {
            try {
                console.log('[Relic Login] Refreshing app session');

                let steamId = null;
                try {
                    steamId = this.steamClient.steamID.getSteamID64();
                } catch (e) {
                    console.log('[Relic Login] No steamId. Disconnecting.');
                    this.steamClient.logOff();
                    return;
                }

                const query = makeQueryString({
                    "accountType": "STEAM",
                    "activeMatchId": "-1",
                    "alias": this.steamAccountName,
                    "appID": APPID[0].toString(),
                    "auth": this.appTicket.ticket,
                    "callNum": "0",
                    "clientLibVersion": "169",
                    "connect_id": "",
                    "country": "US",
                    "installationType": "windows",
                    "language": "en",
                    "lastCallTime": "33072262",
                    "macAddress": "57-4F-4C-4F-4C-4F",
                    "majorVersion": "4.0.0",
                    "minorVersion": "0",
                    "platformUserID": steamId,
                    "startGameToken": "",
                    "syncHash": "[3873360582,3214350563]",
                    "timeoutOverride": "0",
                    "title": "age2",
                });

                const login_request = await fetch(`https://aoe-api.reliclink.com/game/login/platformlogin?${query}`);
                const content = await login_request.text();

                if (content.includes(`/steam/${steamId}`)) {
                    console.log('[Relic Login] Refreshed session');
                    const json = JSON.parse(content);
                    this.relicSession = {
                        sessionId: json[1],
                        lastUpdate: new Date(),
                    };
                } else {
                    console.log('[Relic Login] Relic login failed');
                }
            } catch (e) {
                console.log('[Relic Login] Relic login failed with error');
                // console.log(e);
            }
        }
    }

    async steamLogin() {
        console.log(`{SteamLogin} Logging in`);
        return new Promise<void>((resolve, reject) => {
            this.steamClient.logOn({
                accountName: this.steamAccountName,
                password: this.steamPassword,
                twoFactorCode: generateAuthCode(this.steamSecrets.shared_secret),
            });
            this.steamClient.once("loggedOn", async () => {
                console.log(`{SteamLogin} Logged in succesfully as ${this.steamAccountName}.`);
                resolve();
            });
        });
    }

    @Get('/relic/:path(*)')
    async relic(@Req() request: Request, @Response() res: Res, @Param() params) {
        const method = request.method;
        const endpoint = '/' + params.path;

        console.log(method, endpoint);
        // console.log(request.headers);
        // console.log(request.headers.api_key);
        // console.log(this.apiKey);

        if (request.headers.apikey !== this.apiKey) {
            console.log('Unauthorized. Wrong api key.');
            return 'Unauthorized. Wrong api key.';
        }

        const excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'api_key', 'host', 'user-agent'];

        const headersRaw = Object.entries(request.headers).filter(([key, value]) => !excluded_headers.includes(key.toLowerCase()));
        const headers = Object.assign({}, ...headersRaw.map(([key, value]) => ({ [key]: value })));

        if (method === 'GET') {
            const data = {
                ...request.query,
                callNum: 0,
                connect_id: this.relicSession.sessionId,
                lastCallTime: 33072262,
                sessionID: this.relicSession.sessionId,
            };
            // console.log('Request Headers:', headers);
            // console.log('Request Data:', data); // NEW
            const query = makeQueryString(data);
            const response = await fetch(`https://aoe-api.reliclink.com${endpoint}?${query}`, {
                headers: headers,
            });
            const responseHeaders = {};
            for (const [key, value] of response.headers) {
                if (excluded_headers.includes(key.toLowerCase())) continue;
                responseHeaders[key] = value;
            }
            // console.log('Response Headers:', responseHeaders);
            res
                .set(responseHeaders)
                .send(await response.text());
        } else if (method === 'POST') {
            const data = {
                ...request.body,
                callNum: 0,
                connect_id: this.relicSession.sessionId,
                lastCallTime: 33072262,
                sessionID: this.relicSession.sessionId,
            };
            // console.log('Request Headers:', headers);
            // console.log('Request Data:', data); // NEW
            const query = makeQueryString(data);
            const response = await fetch(`https://aoe-api.reliclink.com${endpoint}?${query}`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: headers,
            });
            const responseHeaders = {};
            for (const [key, value] of response.headers) {
                if (excluded_headers.includes(key.toLowerCase())) continue;
                responseHeaders[key] = value;
            }
            // console.log('Response Headers:', responseHeaders);
            res
                .set(responseHeaders)
                .send(await response.text());
        } else {
            return 'Method not allowed';
        }

        this.metricRequests++;
    }
}
