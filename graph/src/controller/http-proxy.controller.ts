// SPDX-License-Identifier: AGPL-3.0-or-later

import { Controller, Get, Logger, OnApplicationBootstrap, Param, Req, Response } from '@nestjs/common';
import fetch from "node-fetch";
import { Request } from 'express';
import { makeQueryString, sleep } from "../../../collector/src/helper/util";
import { Response as Res } from 'express';
import { sendMetric } from "../../../collector/src/helper/metric-api";

@Controller()
export class HttpProxyController implements OnApplicationBootstrap {
    private readonly logger = new Logger(HttpProxyController.name);

    apiKey = process.env.PROXY_API_KEY;

    metricRequests = 0;

    constructor() {
        console.log(this.apiKey);
    }

    async onApplicationBootstrap() {
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
        res.send('Ready.');
    }

    @Get('/http/:path(*)')
    async http(@Req() request: Request, @Response() res: Res, @Param() params) {
        const method = request.method;
        const endpoint = params.path;

        console.log(method, endpoint);
        // console.log(request.headers);
        // console.log(request.headers.api_key);
        // console.log(this.apiKey);

        if (request.headers.apikey !== this.apiKey) {
            console.log('Unauthorized. Wrong api key.');
            return 'Unauthorized. Wrong api key.';
        }

        const excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'api_key', 'host', 'user-agent'];
        // const included_response_headers = ['content-type'];

        const headersRaw = Object.entries(request.headers).filter(([key, value]) => !excluded_headers.includes(key.toLowerCase()));
        const headers = Object.assign({}, ...headersRaw.map(([key, value]) => ({ [key]: value })));

        if (method === 'GET') {
            const data = {
                ...request.query,
            };
            // console.log('Request Headers:', headers);
            console.log('Request Data:', data);
            const query = makeQueryString(data);
            const response = await fetch(`${endpoint}?${query}`, {
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
            };
            // console.log('Request Headers:', headers);
            console.log('Request Data:', data);
            const query = makeQueryString(data);
            const response = await fetch(`${endpoint}?${query}`, {
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
