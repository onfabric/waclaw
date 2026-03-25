import type { Database, Statement } from 'bun:sqlite';
import type { Route } from '#/db/types.ts';
import { Repository } from '#/repositories/repository.ts';

export class RouteRepository extends Repository {
  private readonly stmtGetByConnectorToken: Statement<Route, [string]>;
  private readonly stmtGetByPhoneNumberId: Statement<Route, [string]>;
  private readonly stmtCreate: Statement<void, [string, string, string, string]>;
  private readonly stmtDelete: Statement<void, [string]>;
  private readonly stmtList: Statement<Route, []>;

  constructor(db: Database) {
    super(db);
    this.stmtGetByConnectorToken = db.query<Route, [string]>(
      'SELECT * FROM routes WHERE connector_token = ?',
    );
    this.stmtGetByPhoneNumberId = db.query<Route, [string]>(
      'SELECT * FROM routes WHERE phone_number_id = ?',
    );
    this.stmtCreate = db.query<void, [string, string, string, string]>(
      'INSERT OR REPLACE INTO routes (id, connector_token, phone_number_id, wa_token) VALUES (?, ?, ?, ?)',
    );
    this.stmtDelete = db.query<void, [string]>('DELETE FROM routes WHERE connector_token = ?');
    this.stmtList = db.query<Route, []>('SELECT * FROM routes');
  }

  getByConnectorToken({ connectorToken }: { connectorToken: string }): Route | null {
    return this.stmtGetByConnectorToken.get(connectorToken);
  }

  getByPhoneNumberId({ phoneNumberId }: { phoneNumberId: string }): Route | null {
    return this.stmtGetByPhoneNumberId.get(phoneNumberId);
  }

  create({
    id,
    connectorToken,
    phoneNumberId,
    waToken,
  }: {
    id: string;
    connectorToken: string;
    phoneNumberId: string;
    waToken: string;
  }): void {
    this.stmtCreate.run(id, connectorToken, phoneNumberId, waToken);
  }

  delete({ connectorToken }: { connectorToken: string }): void {
    this.stmtDelete.run(connectorToken);
  }

  list(): Route[] {
    return this.stmtList.all();
  }
}
