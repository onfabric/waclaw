import { Elysia } from 'elysia';
import { db } from '#db/client.ts';
import { env } from '#lib/env.ts';
import { logger } from '#lib/logger.ts';
import { whatsappClient } from '#lib/whatsapp-client.ts';
import { HealthRepository } from '#repositories/health.repository.ts';
import { MessageRepository } from '#repositories/message.repository.ts';
import { RouteRepository } from '#repositories/route.repository.ts';
import { HealthService } from '#services/health.service.ts';
import { MessageService } from '#services/message.service.ts';
import { PollService } from '#services/poll.service.ts';
import { RouteService } from '#services/route.service.ts';
import { WebhookService } from '#services/webhook.service.ts';
import { WhatsAppService } from '#services/whatsapp.service.ts';

// Repositories
const routeRepo = new RouteRepository(db);
const messageRepo = new MessageRepository(db);
const healthRepo = new HealthRepository(db);

// Services
const routeService = new RouteService(routeRepo);
const pollService = new PollService(messageRepo);
const whatsappService = new WhatsAppService(whatsappClient, env.metaPhoneNumberId);
const messageService = new MessageService(routeService, messageRepo, pollService);
const webhookService = new WebhookService(messageService);
const healthService = new HealthService(healthRepo);

// Plugins
export const LoggerPlugin = new Elysia({ name: 'logger' })
  .decorate('logger', logger)
  .onRequest(({ request }) => {
    logger.info(`→ ${request.method} ${new URL(request.url).pathname}`);
  });

export const HealthServicePlugin = new Elysia({ name: 'service.health' }).decorate(
  'healthService',
  healthService,
);

export const RouteServicePlugin = new Elysia({ name: 'service.route' }).decorate(
  'routeService',
  routeService,
);

export const PollServicePlugin = new Elysia({ name: 'service.poll' }).decorate(
  'pollService',
  pollService,
);

export const WhatsAppServicePlugin = new Elysia({ name: 'service.whatsapp' }).decorate(
  'whatsappService',
  whatsappService,
);

export const MessageServicePlugin = new Elysia({ name: 'service.message' }).decorate(
  'messageService',
  messageService,
);

export const WebhookServicePlugin = new Elysia({ name: 'service.webhook' }).decorate(
  'webhookService',
  webhookService,
);
