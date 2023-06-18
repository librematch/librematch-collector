// SPDX-License-Identifier: AGPL-3.0-or-later

import { Injectable, CanActivate, ExecutionContext, OnModuleInit, HttpStatus, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from "../service/prisma.service";

@Injectable()
export class ApiGuard implements CanActivate, OnModuleInit {

    apiKeys: string[];

    constructor(
        private prisma: PrismaService
    ) { }

    async onModuleInit() {
        await this.updateApiKeys();
        console.log(`ApiGuard loaded ${this.apiKeys.length} api keys`);
        setInterval(() => this.updateApiKeys(), 60 * 1000);
    }

    async updateApiKeys() {
        this.apiKeys = (await this.prisma.api_key.findMany()).map(x => x.api_key);
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        // console.log('incoming api key', request.headers['api_key']);

        if (!request.headers['apikey']) {
            throw new HttpException('No api key provided. Please provide apikey in header.', HttpStatus.UNAUTHORIZED);
        }

        const hasApiKey = this.apiKeys.includes(request.headers['apikey']);

        if (!hasApiKey) {
            throw new HttpException('Provided api key is not valid', HttpStatus.UNAUTHORIZED);
        }

        return true;
    }
}