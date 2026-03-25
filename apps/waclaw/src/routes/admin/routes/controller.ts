import { Elysia } from 'elysia';
import { env } from '#/lib/env.ts';
import { AdminRouteBodySchema, AuthHeaderSchema } from '#/routes/admin/routes/model.ts';
import type { ServicesPlugin } from '#/services/plugin.ts';

const adminAuth = new Elysia({ name: 'Admin.Auth' }).macro({
  isAdmin: {
    beforeHandle({ headers, status }) {
      if (
        (headers as Record<string, string | undefined>).authorization !== `Bearer ${env.adminToken}`
      ) {
        return status(401, 'Invalid admin token');
      }
    },
  },
});

export function createRoute(services: ServicesPlugin) {
  return new Elysia({ prefix: '/admin/routes' })
    .use(services)
    .use(adminAuth)
    .get('/', ({ routeService }) => routeService.list(), {
      headers: AuthHeaderSchema,
      isAdmin: true,
    })
    .post(
      '/',
      ({ body, routeService }) =>
        routeService.create({ phoneNumberId: body.phone_number_id, waToken: body.wa_token }),
      { body: AdminRouteBodySchema, headers: AuthHeaderSchema, isAdmin: true },
    )
    .delete(
      '/:token',
      ({ params, routeService }) => {
        routeService.delete({ connectorToken: params.token });
        return new Response(null, { status: 204 });
      },
      { headers: AuthHeaderSchema, isAdmin: true },
    );
}
