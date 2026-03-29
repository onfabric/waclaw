import { t } from 'elysia';
import { E164PhoneSchema } from '#lib/phone.ts';

const RouteResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  sender_phone: E164PhoneSchema,
  connector_token: t.String({ minLength: 1 }),
  created_at: t.Number({ minimum: 0 }),
  last_polled_at: t.Nullable(t.Number({ minimum: 0 })),
});

export const ListAdminRoutesResponseSchema = t.Array(RouteResponseSchema);

export const CreateAdminRouteBodySchema = t.Object({
  sender_phone: E164PhoneSchema,
});

export const CreateAdminRouteResponseSchema = RouteResponseSchema;

export const AuthHeaderSchema = t.Object({
  authorization: t.String({ minLength: 1 }),
});
