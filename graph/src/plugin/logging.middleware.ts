// SPDX-License-Identifier: AGPL-3.0-or-later

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { format, formatISO } from "date-fns";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {

    const start = new Date();

    // const { ip, method, path: url } = req;
    // const userAgent = req.get('user-agent') || '';

    res.on('close', () => {
      const { statusCode } = res;

      const durationInMs = new Date().getTime() - start.getTime();
      const paddedDurationInMs = durationInMs.toString().padStart(5, ' ');

      const ip1 = req.ip;
      const ip2 = req.connection.remoteAddress;
      const ip3 = (req.headers['x-forwarded-for'] || req.ip || '') as string;

      const origin = req.headers.origin || '';

      // 10/27/2022, 11:01:08 AM

      console.log(`${format(new Date(), 'dd/MM/yyyy hh:mm:ss aa')} ${ip3.padStart(15, ' ')} ${origin.padStart(15, ' ')} ${statusCode} ${paddedDurationInMs}ms ${req.method} ${req.protocol}://${req.headers?.host}${req.originalUrl}`);

      // console.log(req);
      // console.log(
      //     `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
      // );
    });

    next();

    // const start = new Date();
    // await next();
    // const durationInMs = new Date().getTime() - start.getTime();
    // const paddedDurationInMs = durationInMs.toString().padStart(5, ' ');
    // console.log(`${res.statusCode} ${paddedDurationInMs}ms ${req.method} ${req.originalUrl}`);
  }
}
