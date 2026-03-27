import { t } from 'elysia';

export const PollMessageQuerySchema = t.Object({
  token: t.String({ minLength: 1 }),
});

export const PollMessageResponseSchema = t.Object({
  sender_phone: t.String({ minLength: 1 }),
  wa_message_id: t.String({ minLength: 1 }),
  message_id: t.String({ minLength: 1 }),
  body: t.String({ minLength: 1 }),
});

export const PollMessageTimeoutResponseSchema = t.Object({
  status: t.Literal('timeout'),
});
