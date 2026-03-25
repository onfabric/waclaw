import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '#/lib/env.ts';

function openDatabase(): Database {
  mkdirSync(dirname(env.databasePath), { recursive: true });
  const db = new Database(env.databasePath);
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA foreign_keys = ON;');
  return db;
}

export const db = openDatabase();
