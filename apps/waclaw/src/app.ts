import { Elysia } from 'elysia';
import { elysiaErrorHandler } from '#/lib/errors.ts';
import * as adminRoutes from '#/routes/admin/routes/controller.ts';
import * as health from '#/routes/health/controller.ts';
import * as poll from '#/routes/poll/controller.ts';
import * as reply from '#/routes/reply/controller.ts';
import * as webhook from '#/routes/webhook/controller.ts';
import { createServicesPlugin } from '#/services/plugin.ts';

export function createApp() {
  const services = createServicesPlugin();

  return new Elysia<'/'>()
    .onError(elysiaErrorHandler)
    .use(health.createRoute(services))
    .use(webhook.createRoute(services))
    .use(poll.createRoute(services))
    .use(reply.createRoute(services))
    .use(adminRoutes.createRoute(services));
}
