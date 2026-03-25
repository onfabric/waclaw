import { Elysia } from 'elysia';
import { env } from '#/lib/env.ts';
import { BadRequestError, UnauthorizedError } from '#/lib/errors.ts';
import { verifyMetaSignature } from '#/lib/signature.ts';
import type { MetaWebhookPayload } from '#/routes/webhook/model.ts';
import type { ServicesPlugin } from '#/services/plugin.ts';

export function createRoute(services: ServicesPlugin) {
  return new Elysia()
    .use(services)
    .get('/webhook', ({ query }) => {
      const q = query as Record<string, string | undefined>;

      if (q['hub.mode'] !== 'subscribe' || q['hub.verify_token'] !== env.webhookVerifyToken) {
        throw new UnauthorizedError('Webhook verification failed');
      }
      if (!q['hub.challenge']) {
        throw new BadRequestError('Missing hub.challenge');
      }
      return new Response(q['hub.challenge'], { status: 200 });
    })
    .post('/webhook', async ({ request, messageService }) => {
      const rawBody = await request.text();
      const signature = request.headers.get('x-hub-signature-256');

      if (!verifyMetaSignature(rawBody, signature, env.metaAppSecret)) {
        throw new UnauthorizedError('Invalid webhook signature');
      }

      let payload: MetaWebhookPayload;
      try {
        payload = JSON.parse(rawBody) as MetaWebhookPayload;
      } catch {
        throw new BadRequestError('Invalid JSON body');
      }

      if (payload.object === 'whatsapp_business_account') {
        for (const entry of payload.entry) {
          for (const change of entry.changes) {
            const { phone_number_id } = change.value.metadata;
            const messages = change.value.messages ?? [];
            for (const msg of messages) {
              if (msg.type === 'text' && msg.text?.body) {
                await messageService.handleIncoming({
                  phoneNumberId: phone_number_id,
                  waMessageId: msg.id,
                  senderPhone: msg.from,
                  body: msg.text.body,
                });
              }
            }
          }
        }
      }

      return new Response(null, { status: 200 });
    });
}
