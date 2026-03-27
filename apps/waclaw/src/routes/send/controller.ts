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
      routeService.getByConnectorToken({ connectorToken: body.connector_token });
      await whatsappService.sendText({
        to: body.to,
        text: body.text,
      });
      return status(StatusMap.OK, { status: 'success' });
    },
    { body: CreateSendBodySchema, response: { [StatusMap.OK]: CreateSendResponseSchema } },
  );
