// SPDX-License-Identifier: AGPL-3.0-or-later

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus, HttpServer,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { InjectSentry, SentryService } from "@ntegral/nestjs-sentry";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        console.log('EEEEEEEEEXCEPTION', exception);

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}

@Catch()
export class AllExceptionsFilter2 extends BaseExceptionFilter {
    constructor(
        applicationRef: HttpServer,
        private readonly sentryService: SentryService,
    ) {
        super(applicationRef);
    }


    catch(exception: unknown, host: ArgumentsHost) {
        super.catch(exception, host);
        console.log('EXCEPTION', exception);
        this.sentryService.instance().captureException(exception);
    }
}

