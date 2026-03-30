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
    async ({ body, routeService, whatsappService, status }) => {
      const route = routeService.getByConnectorToken({ connectorToken: body.connector_token });

      const message: SendMessageOptions =
        body.type === SendMessageTypeEnum.reaction
          ? {
              type: 'reaction',
              to: route.sender_phone,
              messageId: body.wa_message_id,
              emoji: body.emoji,
            }
          : { type: 'text', to: route.sender_phone, text: body.text };

      await whatsappService.sendMessage(message);

      return status(StatusMap.OK, { status: 'success' });
    },
    { body: CreateSendBodySchema, response: { [StatusMap.OK]: CreateSendResponseSchema } },
  );
