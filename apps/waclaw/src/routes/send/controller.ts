import { Elysia, StatusMap } from 'elysia';
import { CreateSendBodySchema, CreateSendResponseSchema } from '#routes/send/model.ts';
import { LoggerPlugin, RouteServicePlugin, WhatsAppServicePlugin } from '#services/plugins.ts';

export const sendController = new Elysia()
  .use(LoggerPlugin)
  .use(RouteServicePlugin)
  .use(WhatsAppServicePlugin)
  .post(
    '/send',
    async ({ body, routeService, whatsappService, status }) => {
      const route = routeService.getByConnectorToken({ connectorToken: body.connector_token });
      await whatsappService.sendText({
        to: route.sender_phone,
        text: body.text,
      });
      return status(StatusMap.OK, { status: 'success' });
    },
    { body: CreateSendBodySchema, response: { [StatusMap.OK]: CreateSendResponseSchema } },
  );
