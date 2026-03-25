import { Elysia } from 'elysia';
import { db } from '#/db/client.ts';
import { HealthRepository } from '#/repositories/health.repository.ts';
import { MessageRepository } from '#/repositories/message.repository.ts';
import { RouteRepository } from '#/repositories/route.repository.ts';
import { HealthService } from '#/services/health.service.ts';
import { MessageService } from '#/services/message.service.ts';
import { PollService } from '#/services/poll.service.ts';
import { RouteService } from '#/services/route.service.ts';
import { WhatsAppService } from '#/services/whatsapp.service.ts';

export function createServicesPlugin() {
  const healthRepo = new HealthRepository(db);
  const routeRepo = new RouteRepository(db);
  const messageRepo = new MessageRepository(db);

  const healthService = new HealthService(healthRepo);
  const routeService = new RouteService(routeRepo);
  const pollService = new PollService(messageRepo);
  const whatsappService = new WhatsAppService();
  const messageService = new MessageService(routeService, messageRepo, pollService);

  return new Elysia({ name: 'services' })
    .decorate('healthService', healthService)
    .decorate('routeService', routeService)
    .decorate('pollService', pollService)
    .decorate('whatsappService', whatsappService)
    .decorate('messageService', messageService);
}

export type ServicesPlugin = ReturnType<typeof createServicesPlugin>;
