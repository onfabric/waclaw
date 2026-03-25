import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '#/db/client.ts';
import { logger } from '#/lib/logger.ts';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

export function runMigrations(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  const applied = new Set(
    db
      .query<{ name: string }, []>('SELECT name FROM _migrations')
      .all()
      .map((r) => r.name),
  );

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), 'utf8');

    db.transaction(() => {
      db.run(sql);
      db.run('INSERT INTO _migrations (name) VALUES (?)', [file]);
    })();

    logger.info(`[migrate] applied: ${file}`);
  }
}
