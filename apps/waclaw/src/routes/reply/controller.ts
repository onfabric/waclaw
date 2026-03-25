import { Elysia } from 'elysia';
import { ReplyBodySchema } from '#/routes/reply/model.ts';
import type { RouteService } from '#/services/route.service.ts';
import type { WhatsAppService } from '#/services/whatsapp.service.ts';

export function createRoute(routeService: RouteService, whatsappService: WhatsAppService) {
  return new Elysia().post(
    '/reply',
    async ({ body }) => {
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
