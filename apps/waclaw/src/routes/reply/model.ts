import { type Static, t } from 'elysia';

export const ReplyBodySchema = t.Object({
  message_id: t.String({ minLength: 1 }),
  connector_token: t.String({ minLength: 1 }),
  sender_phone: t.String({ minLength: 1 }),
  text: t.String({ minLength: 1 }),
});

export type ReplyBody = Static<typeof ReplyBodySchema>;
