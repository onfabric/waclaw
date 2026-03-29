import type { Database, Statement } from 'bun:sqlite';
import type { Route } from '#db/types.ts';
import { Repository, UniqueConstraintError } from '#repositories/repository.ts';

export class DuplicateSenderPhoneError extends Error {
  constructor() {
    super('Duplicate sender phone');
    this.name = 'DuplicateSenderPhoneError';
  }
}

export class RouteRepository extends Repository {
  private readonly stmtGetByConnectorToken: Statement<Route, [string]>;
  private readonly stmtGetBySenderPhone: Statement<Route, [string]>;
  private readonly stmtCreate: Statement<Route, [string, string, string]>;
  private readonly stmtDelete: Statement<Pick<Route, 'id'>, [string]>;
  private readonly stmtList: Statement<Route, []>;
  private readonly stmtSetLastPolledAtToNow: Statement<void, [string]>;

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
    this.stmtDelete = db.query<Pick<Route, 'id'>, [string]>('DELETE FROM routes WHERE connector_token = ? RETURNING id');
    this.stmtList = db.query<Route, []>('SELECT * FROM routes');
    this.stmtSetLastPolledAtToNow = db.query<void, [string]>(
      'UPDATE routes SET last_polled_at = unixepoch() WHERE connector_token = ?',
    );
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
      const uniqueConstraintError = UniqueConstraintError.tryFromSQLiteError(error);
      if (uniqueConstraintError?.isOnColumn('sender_phone')) {
        throw new DuplicateSenderPhoneError();
      }
      throw error;
    }
  }

  delete({ connectorToken }: { connectorToken: string }): string | null {
    return this.stmtDelete.get(connectorToken)?.id ?? null;
  }

  list(): Route[] {
    return this.stmtList.all();
  }

  setLastPolledAtToNow({ connectorToken }: { connectorToken: string }): void {
    this.stmtSetLastPolledAtToNow.run(connectorToken);
  }
}
