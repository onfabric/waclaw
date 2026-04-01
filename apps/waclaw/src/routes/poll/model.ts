import { t } from 'elysia';
import { E164PhoneSchema } from '#lib/phone.ts';

export const PollMessageQuerySchema = t.Object({
  token: t.String({ minLength: 1 }),
});

export const PollMessageResponseSchema = t.Object({
  sender_phone: E164PhoneSchema,
  wa_message_id: t.String({ minLength: 1 }),
  message_id: t.String({ minLength: 1 }),
  body: t.String(),
  media: t.Optional(
    t.Object({
      mime_type: t.String({ minLength: 1 }),
      base64Data: t.String({ minLength: 1 }),
    }),
  ),
});

export const PollMessageTimeoutResponseSchema = t.Object({
  status: t.Literal('timeout'),
});
