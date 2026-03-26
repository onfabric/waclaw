import { t } from 'elysia';

export const WebhookVerifyQuerySchema = t.Object({
  'hub.mode': t.Optional(t.String()),
  'hub.verify_token': t.Optional(t.String()),
  'hub.challenge': t.Optional(t.String()),
});

export const WebhookVerifyResponseSchema = t.String({ minLength: 1 });

export const WebhookResponseSchema = t.Null();

/**
 * No body schema: body must be read raw for HMAC verification before parsing.
 * Elysia would parse the body before the handler runs, losing the raw bytes
 * needed for HMAC signature verification. The webhook controller reads the raw
 * body as text first, verifies the signature, then manually JSON.parse()s it.
 */
export type MetaWebhookEntry = {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      messages?: Array<{
        from: string;
        id: string;
        type: string;
        text?: { body: string };
      }>;
    };
    field: string;
  }>;
};

export type MetaWebhookPayload = {
  object: string;
  entry: MetaWebhookEntry[];
};
