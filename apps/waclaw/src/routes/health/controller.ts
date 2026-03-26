import { Elysia } from 'elysia';
import { HealthServicePlugin, LoggerPlugin } from '#/services/plugins.ts';

export const healthController = new Elysia()
  .use(LoggerPlugin)
  .use(HealthServicePlugin)
  .get('/health', ({ healthService }) => healthService.check());
