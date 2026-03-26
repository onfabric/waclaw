import { runMigrations } from '#db/migrate.ts';
import { env } from '#lib/env.ts';
import { logger } from '#lib/logger.ts';

runMigrations();

// Import the app dynamically to let the migrations run first
const { createApp } = await import('#app.ts');

const { server } = createApp().listen({ port: env.port, hostname: '0.0.0.0' });

logger.info(`[waclaw] listening on ${server!.url.origin}`);
