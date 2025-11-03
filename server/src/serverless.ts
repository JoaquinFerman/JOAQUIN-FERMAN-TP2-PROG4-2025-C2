import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express');
import type { Request, Response, Express } from 'express';

// Cache the express app across invocations to avoid re-bootstrap on warm starts
let cachedExpressApp: Express | null = null;

export default async function handler(req: Request, res: Response) {
  if (!cachedExpressApp) {
    const expressApp = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    // allow graceful shutdown hooks
    nestApp.enableShutdownHooks();
    await nestApp.init();
    cachedExpressApp = expressApp;
    console.log('[serverless] Nest app initialized and cached');
  }

  // cachedExpressApp is guaranteed to be set at this point
  return cachedExpressApp!(req, res);
}
