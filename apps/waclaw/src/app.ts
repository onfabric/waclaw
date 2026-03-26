import { Elysia } from 'elysia';
import { elysiaErrorHandler } from '#/lib/errors.ts';
import { adminRoutesController } from '#/routes/admin/routes/controller.ts';
import { healthController } from '#/routes/health/controller.ts';
import { pollController } from '#/routes/poll/controller.ts';
import { replyController } from '#/routes/reply/controller.ts';
import { webhookController } from '#/routes/webhook/controller.ts';

export function createApp() {
  return new Elysia()
    .onError(elysiaErrorHandler)
    .use(healthController)
    .use(webhookController)
    .use(pollController)
    .use(replyController)
    .use(adminRoutesController);
}
