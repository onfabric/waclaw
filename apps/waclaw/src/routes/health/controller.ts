import { Elysia } from 'elysia';
import type { HealthService } from '#/services/health.service.ts';

export function createRoute(healthService: HealthService) {
  return new Elysia().get('/health', () => healthService.check());
}
