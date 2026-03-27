import { Elysia } from 'elysia';
import { env } from '#lib/env.ts';
import { elysiaErrorHandler } from '#lib/errors.ts';
import { adminRoutesController } from '#routes/admin/routes/controller.ts';
import { healthController } from '#routes/health/controller.ts';
import { pollController } from '#routes/poll/controller.ts';
import { replyController } from '#routes/reply/controller.ts';
import { sendController } from '#routes/send/controller.ts';
import { webhookController } from '#routes/webhook/controller.ts';

export function createApp() {
  return new Elysia({
    serve: {
      ...(env.httpsCertPath && env.httpsKeyPath
        ? {
            tls: {
              cert: Bun.file(env.httpsCertPath),
              key: Bun.file(env.httpsKeyPath),
            },
          }
        : {}),
    },
  })
    .onError(elysiaErrorHandler)
    .use(healthController)
    .use(webhookController)
    .use(pollController)
    .use(replyController)
    .use(sendController)
    .use(adminRoutesController);
}

export type App = ReturnType<typeof createApp>;
