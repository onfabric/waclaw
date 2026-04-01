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
  emoji: t.String({ description: 'Empty string to remove the reaction' }),
});

const SendAudioBodySchema = t.Object({
  type: t.Literal(SendMessageTypeEnum.audio),
  connector_token: t.String({ minLength: 1 }),
  /** Base64-encoded audio data */
  base64_data: t.String({ minLength: 1 }),
  /** MIME type of the audio (e.g. audio/ogg, audio/mpeg) */
  mime_type: t.String({ minLength: 1 }),
  message_id: t.Optional(t.String({ minLength: 1 })),
});

export const CreateSendBodySchema = t.Union([
  SendTextBodySchema,
  SendReactionBodySchema,
  SendAudioBodySchema,
]);

export const CreateSendResponseSchema = t.Object({
  status: t.Literal('success'),
});
