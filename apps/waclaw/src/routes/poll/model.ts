import { type Static, t } from 'elysia';

export const PollQuerySchema = t.Object({
  token: t.String({ minLength: 1 }),
});

export type PollQuery = Static<typeof PollQuerySchema>;
