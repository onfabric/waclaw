import { normalizeWebhook, verifySignature } from '@kapso/whatsapp-cloud-api/server';
import { Elysia, StatusMap } from 'elysia';
import { env } from '#lib/env.ts';
import { BadRequestError, UnauthorizedError } from '#lib/errors.ts';
import {
  WebhookResponseSchema,
  WebhookVerifyQuerySchema,
  WebhookVerifyResponseSchema,
} from '#routes/webhook/model.ts';
import { LoggerPlugin, WebhookServicePlugin } from '#services/plugins.ts';

export const webhookController = new Elysia()
  .use(LoggerPlugin)
  .use(WebhookServicePlugin)
  .get(
    '/webhook',
    ({ query, logger, status }) => {
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
      return status(StatusMap.OK, query['hub.challenge']);
    },
    {
      query: WebhookVerifyQuerySchema,
      response: { [StatusMap.OK]: WebhookVerifyResponseSchema },
    },
  )
  .post(
    '/webhook',
    async ({ request, webhookService, logger, status }) => {
      const rawBody = await request.text();
      const signature = request.headers.get('x-hub-signature-256');

      if (
        !verifySignature({
          appSecret: env.metaAppSecret,
          rawBody,
          signatureHeader: signature ?? undefined,
        })
      ) {
        logger.error('Webhook signature verification failed');
        throw new UnauthorizedError('Invalid webhook signature');
      }

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        throw new BadRequestError('Invalid JSON body');
      }

      const normalized = normalizeWebhook(payload);
      await webhookService.processIncomingPayload(normalized);

      return status(StatusMap.OK, { status: 'success' });
    },
    {
      response: { [StatusMap.OK]: WebhookResponseSchema },
    },
  );
