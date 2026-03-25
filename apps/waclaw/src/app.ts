import { Elysia } from 'elysia';
import { db } from '#/db/client.ts';
import { elysiaErrorHandler } from '#/lib/errors.ts';
import { HealthRepository } from '#/repositories/health.repository.ts';
import { MessageRepository } from '#/repositories/message.repository.ts';
import { RouteRepository } from '#/repositories/route.repository.ts';
import * as adminRoutes from '#/routes/admin/routes/controller.ts';
import * as health from '#/routes/health/controller.ts';
import * as poll from '#/routes/poll/controller.ts';
import * as reply from '#/routes/reply/controller.ts';
import * as webhook from '#/routes/webhook/controller.ts';
import { HealthService } from '#/services/health.service.ts';
import { MessageService } from '#/services/message.service.ts';
import { PollService } from '#/services/poll.service.ts';
import { RouteService } from '#/services/route.service.ts';
import { WhatsAppService } from '#/services/whatsapp.service.ts';

export function createApp() {
  const healthRepo = new HealthRepository(db);
  const routeRepo = new RouteRepository(db);
  const messageRepo = new MessageRepository(db);

  const healthService = new HealthService(healthRepo);
  const routeService = new RouteService(routeRepo);
  const pollService = new PollService(messageRepo);
  const whatsappService = new WhatsAppService();
  const messageService = new MessageService(routeService, messageRepo, pollService);

  return new Elysia()
    .onError(elysiaErrorHandler)
    .use(health.createRoute(healthService))
    .use(webhook.createRoute(messageService))
    .use(poll.createRoute(routeService, pollService))
    .use(reply.createRoute(routeService, whatsappService))
    .use(adminRoutes.createRoute(routeService));
}
