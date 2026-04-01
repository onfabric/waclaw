import { Elysia, StatusMap } from 'elysia';
import { CreateSendBodySchema, CreateSendResponseSchema } from '#routes/send/model.ts';
import { LoggerPlugin, RouteServicePlugin, WhatsAppServicePlugin } from '#services/plugins.ts';
import type { SendMessageOptions } from '#services/whatsapp.service.ts';
import { SendMessageTypeEnum } from '#types.ts';

export const sendController = new Elysia()
  .use(LoggerPlugin)
  .use(RouteServicePlugin)
  .use(WhatsAppServicePlugin)
  .post(
    '/send',
    async ({ body, routeService, whatsappService, logger, status }) => {
      const route = routeService.getByConnectorToken({ connectorToken: body.connector_token });

      let message: SendMessageOptions;
      switch (body.type) {
        case SendMessageTypeEnum.reaction:
          message = {
            type: 'reaction',
            to: route.sender_phone,
            messageId: body.wa_message_id,
            emoji: body.emoji,
          };
          break;
        case SendMessageTypeEnum.audio:
          message = {
            type: 'audio',
            to: route.sender_phone,
            base64Data: body.base64_data,
            mimeType: body.mime_type,
          };
          break;
        case SendMessageTypeEnum.image:
          message = {
            type: 'image',
            to: route.sender_phone,
            base64Data: body.base64_data,
            mimeType: body.mime_type,
            caption: body.caption,
          };
          break;
        default:
          message = { type: 'text', to: route.sender_phone, text: body.text };
          break;
      }

      const logParts: Record<string, string> = {
        text: `send: type=text to=${route.sender_phone} size=${body.type === 'text' ? body.text.length : 0}`,
        reaction: `send: type=reaction to=${route.sender_phone} emoji=${body.type === 'reaction' ? body.emoji || '<empty>' : ''}`,
        audio: `send: type=audio to=${route.sender_phone} mime=${body.type === 'audio' ? body.mime_type : ''}`,
        image: `send: type=image to=${route.sender_phone} mime=${body.type === 'image' ? body.mime_type : ''}`,
      };
      logger.info(logParts[body.type]);

      await whatsappService.sendMessage(message);

      return status(StatusMap.OK, { status: 'success' });
    },
    { body: CreateSendBodySchema, response: { [StatusMap.OK]: CreateSendResponseSchema } },
  );
