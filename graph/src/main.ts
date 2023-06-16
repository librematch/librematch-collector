/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// import {LeaderboardRow} from "./object/objects";
// const g: LeaderboardRow = null;

import { Logger } from '@nestjs/common';
import {HttpAdapterHost, NestFactory} from '@nestjs/core';

import { AppModule } from './app/app.module';
import compression from "compression";
import {setupTracing} from "./setup";
import { WsAdapter } from '@nestjs/platform-ws';
import {AllExceptionsFilter, AllExceptionsFilter2} from "./plugin/exceptions-filter";
import {SentryService} from "@ntegral/nestjs-sentry";


async function bootstrap() {

  setupTracing();

  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors();
  app.use(compression());

  const sentryService = app.get<SentryService>(SentryService);
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter2(httpAdapter as any, sentryService));
  // app.useGlobalFilters(new AllExceptionsFilter(httpAdapter as any));

  const port = process.env.PORT || 3334;
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port);
  });
}

bootstrap();
