import { Elysia } from 'elysia';
import { env } from '#lib/env.ts';
import { AdminRouteBodySchema, AuthHeaderSchema } from '#routes/admin/routes/model.ts';
import { LoggerPlugin, RouteServicePlugin } from '#services/plugins.ts';

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

export const adminRoutesController = new Elysia({ prefix: '/admin/routes' })
  .use(LoggerPlugin)
  .use(RouteServicePlugin)
  .use(adminAuth)
  .get('/', ({ routeService }) => routeService.list(), {
    headers: AuthHeaderSchema,
    isAdmin: true,
  })
  .post(
    '/',
    ({ body, routeService }) =>
      routeService.create({ phoneNumberId: body.phone_number_id }),
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
