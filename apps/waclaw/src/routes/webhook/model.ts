import { t } from 'elysia';

export const WebhookVerifyQuerySchema = t.Object({
  'hub.mode': t.Optional(t.String()),
  'hub.verify_token': t.Optional(t.String()),
  'hub.challenge': t.Optional(t.String()),
});

export const WebhookVerifyResponseSchema = t.String({ minLength: 1 });

export const WebhookResponseSchema = t.Object({
  status: t.Literal('success'),
});
