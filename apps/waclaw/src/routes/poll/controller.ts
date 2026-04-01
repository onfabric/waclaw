import { Elysia, StatusMap } from 'elysia';
import {
  PollMessageQuerySchema,
  PollMessageResponseSchema,
  PollMessageTimeoutResponseSchema,
} from '#routes/poll/model.ts';
import { LoggerPlugin, PollServicePlugin, RouteServicePlugin } from '#services/plugins.ts';

const SECONDS_TO_MILLISECONDS = 1000;
const POLL_REQUEST_TIMEOUT_MS = 30 * SECONDS_TO_MILLISECONDS;

export const pollController = new Elysia()
  .use(LoggerPlugin)
  .use(RouteServicePlugin)
  .use(PollServicePlugin)
  .get(
    '/poll',
    async ({ query, request, server, routeService, pollService, logger, status }) => {
      if (server) {
        // Disable Bun's idle timeout for this request — the default (10 s) would
        // kill the connection before the 30 s park window completes.
        // See https://bun.com/docs/runtime/http/server#per-request-controls
        server.timeout(request, 0);
      } else {
        logger.warn('Bun server not available');
      }

      routeService.recordPollActivity({ connectorToken: query.token });

      const result = await pollService.park({
        connectorToken: query.token,
        timeoutMs: POLL_REQUEST_TIMEOUT_MS,
      });

      if (result === null) {
        return status(StatusMap['Request Timeout'], { status: 'timeout' });
      }

      return status(StatusMap.OK, result);
    },
    {
      query: PollMessageQuerySchema,
      response: {
        [StatusMap.OK]: PollMessageResponseSchema,
        [StatusMap['Request Timeout']]: PollMessageTimeoutResponseSchema,
      },
    },
  );
