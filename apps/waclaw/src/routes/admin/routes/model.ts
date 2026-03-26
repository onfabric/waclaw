import { t } from 'elysia';

const RouteResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  sender_phone: t.String({ minLength: 1 }),
  connector_token: t.String({ minLength: 1 }),
  created_at: t.Number({ minimum: 0 }),
});

export const ListAdminRoutesResponseSchema = t.Array(RouteResponseSchema);

export const CreateAdminRouteBodySchema = t.Object({
  sender_phone: t.String({ minLength: 1 }),
});

export const CreateAdminRouteResponseSchema = RouteResponseSchema;

export const DeleteAdminRouteResponseSchema = t.Null();

export const AuthHeaderSchema = t.Object({
  authorization: t.String({ minLength: 1 }),
});
