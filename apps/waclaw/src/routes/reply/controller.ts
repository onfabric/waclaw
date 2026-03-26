import { Elysia, StatusMap } from 'elysia';
import { CreateReplyBodySchema, CreateReplyResponseSchema } from '#routes/reply/model.ts';
import { LoggerPlugin, RouteServicePlugin, WhatsAppServicePlugin } from '#services/plugins.ts';

export const replyController = new Elysia()
  .use(LoggerPlugin)
  .use(RouteServicePlugin)
  .use(WhatsAppServicePlugin)
  .post(
    '/reply',
    async ({ body, routeService, whatsappService, status }) => {
      const route = routeService.getByConnectorToken({ connectorToken: body.connector_token });
      await whatsappService.sendText({
        to: route.sender_phone,
        text: body.text,
      });
      return status(StatusMap.OK, null);
    },
    { body: CreateReplyBodySchema, response: { [StatusMap.OK]: CreateReplyResponseSchema } },
  );
