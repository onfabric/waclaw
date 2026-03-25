import { type Static, t } from 'elysia';

export const AdminRouteBodySchema = t.Object({
  phone_number_id: t.String({ minLength: 1 }),
  wa_token: t.String({ minLength: 1 }),
});

export const AuthHeaderSchema = t.Object({
  authorization: t.String({ minLength: 1 }),
});

export type AdminRouteBody = Static<typeof AdminRouteBodySchema>;
export type AuthHeader = Static<typeof AuthHeaderSchema>;
