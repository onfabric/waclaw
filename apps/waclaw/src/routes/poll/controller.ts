import { Elysia } from 'elysia';
import { PollQuerySchema } from '#/routes/poll/model.ts';
import type { PollService } from '#/services/poll.service.ts';
import type { RouteService } from '#/services/route.service.ts';

export function createRoute(routeService: RouteService, pollService: PollService) {
  return new Elysia().get(
    '/poll',
    async ({ query }) => {
      routeService.getByConnectorToken({ connectorToken: query.token });
      const result = await pollService.park({ connectorToken: query.token, timeoutMs: 30_000 });
      return result ?? { message: null };
    },
    { query: PollQuerySchema },
  );
}
