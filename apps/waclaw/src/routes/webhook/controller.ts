import { Elysia } from 'elysia';
import { env } from '#/lib/env.ts';
import { BadRequestError, UnauthorizedError } from '#/lib/errors.ts';
import { verifyMetaSignature } from '#/lib/signature.ts';
import type { MetaWebhookPayload } from '#/routes/webhook/model.ts';
import { WebhookVerifyQuerySchema } from '#/routes/webhook/model.ts';
import { LoggerPlugin, WebhookServicePlugin } from '#/services/plugins.ts';

export const webhookController = new Elysia()
  .use(LoggerPlugin)
  .use(WebhookServicePlugin)
  .get(
    '/webhook',
    ({ query, logger }) => {
      logger.info('Query:', query);

      if (
        query['hub.mode'] !== 'subscribe' ||
        query['hub.verify_token'] !== env.webhookVerifyToken
      ) {
        throw new UnauthorizedError('Webhook verification failed');
      }
      if (!query['hub.challenge']) {
        throw new BadRequestError('Missing hub.challenge');
      }
      return new Response(query['hub.challenge'], { status: 200 });
    },
    { query: WebhookVerifyQuerySchema },
  )
  .post('/webhook', async ({ request, webhookService, logger }) => {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    logger.info('Raw body:', rawBody);

    if (!verifyMetaSignature(rawBody, signature, env.metaAppSecret)) {
      throw new UnauthorizedError('Invalid webhook signature');
    }

    let payload: MetaWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new BadRequestError('Invalid JSON body');
    }

    await webhookService.processIncomingPayload(payload);

    return new Response(null, { status: 200 });
  });
