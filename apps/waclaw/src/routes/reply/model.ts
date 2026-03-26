import { t } from 'elysia';

export const CreateReplyBodySchema = t.Object({
  message_id: t.String({ minLength: 1 }),
  connector_token: t.String({ minLength: 1 }),
  text: t.String({ minLength: 1 }),
});

export const CreateReplyResponseSchema = t.Null();
