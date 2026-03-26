import { type Static, t } from 'elysia';

export const AdminRouteBodySchema = t.Object({
  sender_phone: t.String({ minLength: 1 }),
});

export const AuthHeaderSchema = t.Object({
  authorization: t.String({ minLength: 1 }),
});

export type AdminRouteBody = Static<typeof AdminRouteBodySchema>;
export type AuthHeader = Static<typeof AuthHeaderSchema>;
