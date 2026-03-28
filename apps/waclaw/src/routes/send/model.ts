import { t } from 'elysia';

export const CreateSendBodySchema = t.Object({
  connector_token: t.String({ minLength: 1 }),
  text: t.String({ minLength: 1 }),
  message_id: t.Optional(t.String({ minLength: 1 })),
});

export const CreateSendResponseSchema = t.Object({
  status: t.Literal('success'),
});
