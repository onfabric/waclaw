import { Elysia, StatusMap } from 'elysia';
import { env } from '#lib/env.ts';
import {
  AuthHeaderSchema,
  CreateAdminRouteBodySchema,
  CreateAdminRouteResponseSchema,
  DeleteAdminRouteResponseSchema,
  ListAdminRoutesResponseSchema,
} from '#routes/admin/routes/model.ts';
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
  .get(
    '/',
    ({ routeService, status }) => {
      const routes = routeService.list();
      return status(StatusMap.OK, routes);
    },
    {
      headers: AuthHeaderSchema,
      isAdmin: true,
      response: {
        [StatusMap.OK]: ListAdminRoutesResponseSchema,
      },
    },
  )
  .post(
    '/',
    ({ body, routeService, status }) => {
      const route = routeService.create({ senderPhone: body.sender_phone });
      return status(StatusMap.OK, route);
    },
    {
      body: CreateAdminRouteBodySchema,
      headers: AuthHeaderSchema,
      response: {
        [StatusMap.OK]: CreateAdminRouteResponseSchema,
      },
      isAdmin: true,
    },
  )
  .delete(
    '/:token',
    ({ params, routeService, status }) => {
      routeService.delete({ connectorToken: params.token });
      return status(StatusMap['No Content'], null);
    },
    {
      headers: AuthHeaderSchema,
      isAdmin: true,
      response: {
        [StatusMap['No Content']]: DeleteAdminRouteResponseSchema,
      },
    },
  );
