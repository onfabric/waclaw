import { Elysia } from 'elysia';
import { env } from '#/lib/env.ts';
import { AdminRouteBodySchema, AuthHeaderSchema } from '#/routes/admin/routes/model.ts';
import type { RouteService } from '#/services/route.service.ts';

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

export function createRoute(routeService: RouteService) {
  return new Elysia({ prefix: '/admin/routes' })
    .use(adminAuth)
    .get('/', () => routeService.list(), { headers: AuthHeaderSchema, isAdmin: true })
    .post(
      '/',
      ({ body }) =>
        routeService.create({ phoneNumberId: body.phone_number_id, waToken: body.wa_token }),
      { body: AdminRouteBodySchema, headers: AuthHeaderSchema, isAdmin: true },
    )
    .delete(
      '/:token',
      ({ params }) => {
        routeService.delete({ connectorToken: params.token });
        return new Response(null, { status: 204 });
      },
      { headers: AuthHeaderSchema, isAdmin: true },
    );
}
