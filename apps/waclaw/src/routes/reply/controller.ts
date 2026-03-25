import { Elysia } from 'elysia';
import { ReplyBodySchema } from '#/routes/reply/model.ts';
import type { ServicesPlugin } from '#/services/plugin.ts';

export function createRoute(services: ServicesPlugin) {
  return new Elysia().use(services).post(
    '/reply',
    async ({ body, routeService, whatsappService }) => {
      const route = routeService.getByConnectorToken({ connectorToken: body.connector_token });
      await whatsappService.sendText({
        phoneNumberId: route.phone_number_id,
        waToken: route.wa_token,
        to: body.sender_phone,
        text: body.text,
      });
      return new Response(null, { status: 200 });
    },
    { body: ReplyBodySchema },
  );
}
