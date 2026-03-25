import { createApp } from '#/app.ts';
import { runMigrations } from '#/db/migrate.ts';
import { env } from '#/lib/env.ts';
import { logger } from '#/lib/logger.ts';

runMigrations();

createApp().listen(env.port);

logger.info(`[waclaw] listening on http://localhost:${env.port}`);
