import { t } from 'elysia';
import { SendMessageTypeEnum } from '#types.ts';

const SendTextBodySchema = t.Object({
  type: t.Literal(SendMessageTypeEnum.text),
  connector_token: t.String({ minLength: 1 }),
  text: t.String({ minLength: 1 }),
  message_id: t.Optional(t.String({ minLength: 1 })),
});

const SendReactionBodySchema = t.Object({
  type: t.Literal(SendMessageTypeEnum.reaction),
  connector_token: t.String({ minLength: 1 }),
  wa_message_id: t.String({ minLength: 1 }),
  emoji: t.String(),
});

export const CreateSendBodySchema = t.Union([SendTextBodySchema, SendReactionBodySchema]);

export const CreateSendResponseSchema = t.Object({
  status: t.Literal('success'),
});
