import { createApp } from '#app.ts';
import { runMigrations } from '#db/migrate.ts';
import { env } from '#lib/env.ts';
import { logger } from '#lib/logger.ts';

runMigrations();

const { server } = createApp().listen({ port: env.port, hostname: '0.0.0.0' });

logger.info(`[waclaw] listening on ${server!.url.origin}`);
