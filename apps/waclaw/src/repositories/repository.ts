import type { Database, SQLiteError } from 'bun:sqlite';

export enum SqliteErrorCode {
  /**
   * @see https://www.sqlite.org/rescode.html#constraint_unique
   */
  SQLITE_CONSTRAINT_UNIQUE = 2067,
}

export class DuplicateEntryError extends Error {
  readonly column: string;

  constructor(column: string) {
    super(`Duplicate entry on column: ${column}`);
    this.name = 'DuplicateEntryError';
    this.column = column;
  }

  static fromSQLiteError(cause: SQLiteError): DuplicateEntryError {
    // SQLite message format: "UNIQUE constraint failed: table.column"
    const column = cause.message.split(': ')[1]?.split('.')[1] ?? 'unknown';
    return new DuplicateEntryError(column);
  }
}

export abstract class Repository {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }
}
