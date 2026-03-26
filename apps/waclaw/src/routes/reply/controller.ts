import { Elysia } from 'elysia';
import { ReplyBodySchema } from '#routes/reply/model.ts';
import { LoggerPlugin, RouteServicePlugin, WhatsAppServicePlugin } from '#services/plugins.ts';

export const replyController = new Elysia()
  .use(LoggerPlugin)
  .use(RouteServicePlugin)
  .use(WhatsAppServicePlugin)
  .post(
    '/reply',
    async ({ body, routeService, whatsappService }) => {
      const route = routeService.getByConnectorToken({ connectorToken: body.connector_token });
      await whatsappService.sendText({
        phoneNumberId: route.phone_number_id,
        to: body.sender_phone,
        text: body.text,
      });
      return new Response(null, { status: 200 });
    },
    { body: ReplyBodySchema },
  );
