import { t } from 'elysia';

export const PollQuerySchema = t.Object({
  token: t.String({ minLength: 1 }),
});

export const PollResponseSchema = t.Union([
  t.Null(),
  t.Object({
    sender_phone: t.String({ minLength: 1 }),
    wa_message_id: t.String({ minLength: 1 }),
    message_id: t.String({ minLength: 1 }),
    body: t.String({ minLength: 1 }),
  }),
]);
