import { Elysia } from 'elysia';
import { PollQuerySchema } from '#/routes/poll/model.ts';
import type { ServicesPlugin } from '#/services/plugin.ts';

export function createRoute(services: ServicesPlugin) {
  return new Elysia().use(services).get(
    '/poll',
    async ({ query, routeService, pollService }) => {
      routeService.getByConnectorToken({ connectorToken: query.token });
      const result = await pollService.park({ connectorToken: query.token, timeoutMs: 30_000 });
      return result ?? { message: null };
    },
    { query: PollQuerySchema },
  );
}
