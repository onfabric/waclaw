import { type Database, SQLiteError } from 'bun:sqlite';

enum SqliteErrorCode {
  /**
   * @see https://www.sqlite.org/rescode.html#constraint_unique
   */
  SQLITE_CONSTRAINT_UNIQUE = 2067,
}

export class UniqueConstraintError extends Error {
  static readonly sqliteErrorCode = SqliteErrorCode.SQLITE_CONSTRAINT_UNIQUE;

  private constructor(override cause: SQLiteError) {
    super(cause.message);
    this.name = 'UniqueConstraintError';
  }

  static tryFromSQLiteError(error: unknown): UniqueConstraintError | null {
    if (error instanceof SQLiteError && error.errno === UniqueConstraintError.sqliteErrorCode) {
      return new UniqueConstraintError(error);
    }
    return null;
  }

  isOnColumn(column: string): boolean {
    // SQLite message format: "UNIQUE constraint failed: table.column"
    const parsedColumn = this.cause.message.split(': ')[1]?.split('.')[1];
    if (!parsedColumn) {
      return false;
    }
    return parsedColumn === column;
  }
}

export abstract class Repository {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }
}
