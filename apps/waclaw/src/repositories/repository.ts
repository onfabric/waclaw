import type { Database } from 'bun:sqlite';

export abstract class Repository {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }
}
