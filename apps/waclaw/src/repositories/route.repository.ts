import type { Database, Statement } from 'bun:sqlite';
import type { Route } from '#db/types.ts';
import { Repository } from '#repositories/repository.ts';

export class RouteRepository extends Repository {
  private readonly stmtGetByConnectorToken: Statement<Route, [string]>;
  private readonly stmtGetBySenderPhone: Statement<Route, [string]>;
  private readonly stmtCreate: Statement<void, [string, string, string]>;
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
    this.stmtCreate = db.query<void, [string, string, string]>(
      'INSERT OR REPLACE INTO routes (id, connector_token, sender_phone) VALUES (?, ?, ?)',
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

  create({ id, connectorToken, senderPhone }: { id: string; connectorToken: string; senderPhone: string }): void {
    this.stmtCreate.run(id, connectorToken, senderPhone);
  }

  delete({ connectorToken }: { connectorToken: string }): void {
    this.stmtDelete.run(connectorToken);
  }

  list(): Route[] {
    return this.stmtList.all();
  }
}
