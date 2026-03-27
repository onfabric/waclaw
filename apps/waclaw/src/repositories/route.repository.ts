import { type Database, SQLiteError, type Statement } from 'bun:sqlite';
import type { Route } from '#db/types.ts';
import { DuplicateEntryError, Repository, SqliteErrorCode } from '#repositories/repository.ts';

export class DuplicateSenderPhoneError extends DuplicateEntryError {
  constructor() {
    super('sender_phone');
    this.name = 'DuplicateSenderPhoneError';
  }
}

export class RouteRepository extends Repository {
  private readonly stmtGetByConnectorToken: Statement<Route, [string]>;
  private readonly stmtGetBySenderPhone: Statement<Route, [string]>;
  private readonly stmtCreate: Statement<Route, [string, string, string]>;
  private readonly stmtDelete: Statement<void, [string]>;
  private readonly stmtList: Statement<Route, []>;

  constructor(db: Database) {
    super(db);
    this.stmtGetByConnectorToken = db.query<Route, [string]>(
      'SELECT * FROM routes WHERE connector_token = ?',
    );
    this.stmtGetBySenderPhone = db.query<Route, [string]>(
      'SELECT * FROM routes WHERE sender_phone = ?',
    );
    this.stmtCreate = db.query<Route, [string, string, string]>(
      'INSERT INTO routes (id, connector_token, sender_phone) VALUES (?, ?, ?) RETURNING *',
    );
    this.stmtDelete = db.query<void, [string]>('DELETE FROM routes WHERE connector_token = ?');
    this.stmtList = db.query<Route, []>('SELECT * FROM routes');
  }

  getByConnectorToken({ connectorToken }: { connectorToken: string }): Route | null {
    return this.stmtGetByConnectorToken.get(connectorToken);
  }

  getBySenderPhone({ senderPhone }: { senderPhone: string }): Route | null {
    return this.stmtGetBySenderPhone.get(senderPhone);
  }

  create({
    id,
    connectorToken,
    senderPhone,
  }: {
    id: string;
    connectorToken: string;
    senderPhone: string;
  }): Route {
    try {
      return this.stmtCreate.get(id, connectorToken, senderPhone)!;
    } catch (error) {
      if (
        error instanceof SQLiteError &&
        error.errno === SqliteErrorCode.SQLITE_CONSTRAINT_UNIQUE
      ) {
        const duplicateError = DuplicateEntryError.fromSQLiteError(error);
        throw duplicateError.column === 'sender_phone'
          ? new DuplicateSenderPhoneError()
          : duplicateError;
      }
      throw error;
    }
  }

  delete({ connectorToken }: { connectorToken: string }): void {
    this.stmtDelete.run(connectorToken);
  }

  list(): Route[] {
    return this.stmtList.all();
  }
}
