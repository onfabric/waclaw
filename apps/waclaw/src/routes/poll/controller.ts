import { Elysia, StatusMap } from 'elysia';
import { PollQuerySchema, PollResponseSchema } from '#routes/poll/model.ts';
import { LoggerPlugin, PollServicePlugin, RouteServicePlugin } from '#services/plugins.ts';

export const pollController = new Elysia()
  .use(LoggerPlugin)
  .use(RouteServicePlugin)
  .use(PollServicePlugin)
  .get(
    '/poll',
    async ({ query, routeService, pollService, set, status }) => {
      routeService.getByConnectorToken({ connectorToken: query.token });
      const result = await pollService.park({ connectorToken: query.token, timeoutMs: 30_000 });

      // Explicit headers for long polling requests
      set.headers['Cache-Control'] = 'no-store';
      // biome-ignore lint/complexity/useLiteralKeys: consistent with the others
      set.headers['Connection'] = 'keep-alive';

      return status(StatusMap.OK, result);
    },
    { query: PollQuerySchema, response: { [StatusMap.OK]: PollResponseSchema } },
  );
