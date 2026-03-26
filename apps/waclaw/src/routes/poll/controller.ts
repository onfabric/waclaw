import { Elysia } from 'elysia';
import { PollQuerySchema } from '#routes/poll/model.ts';
import { LoggerPlugin, PollServicePlugin, RouteServicePlugin } from '#services/plugins.ts';

export const pollController = new Elysia()
  .use(LoggerPlugin)
  .use(RouteServicePlugin)
  .use(PollServicePlugin)
  .get(
    '/poll',
    async ({ query, routeService, pollService }) => {
      routeService.getByConnectorToken({ connectorToken: query.token });
      const result = await pollService.park({ connectorToken: query.token, timeoutMs: 30_000 });
      return result ?? { message: null };
    },
    { query: PollQuerySchema },
  );
