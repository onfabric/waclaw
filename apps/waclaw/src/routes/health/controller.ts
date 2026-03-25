import { Elysia } from 'elysia';
import type { ServicesPlugin } from '#/services/plugin.ts';

export function createRoute(services: ServicesPlugin) {
  return new Elysia().use(services).get('/health', ({ healthService }) => healthService.check());
}
