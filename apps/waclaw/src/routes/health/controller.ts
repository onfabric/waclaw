import { Elysia, StatusMap } from 'elysia';
import { GetHealthResponseSchema } from '#routes/health/model.ts';
import { HealthServicePlugin, LoggerPlugin } from '#services/plugins.ts';

export const healthController = new Elysia()
  .use(LoggerPlugin)
  .use(HealthServicePlugin)
  .get(
    '/health',
    ({ healthService, status }) => {
      const result = healthService.check();
      return status(StatusMap.OK, result);
    },
    {
      response: {
        [StatusMap.OK]: GetHealthResponseSchema,
      },
    },
  );
