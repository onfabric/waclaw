import type { Database, Statement } from 'bun:sqlite';
import type { QueuedMessage } from '#db/types.ts';
import { Repository } from '#repositories/repository.ts';

export class MessageRepository extends Repository {
  private readonly stmtCreate: Statement<void, [string, string, string, string, string]>;
  private readonly stmtGetOldest: Statement<QueuedMessage, [string]>;
  private readonly stmtDeleteById: Statement<void, [string]>;
  private readonly stmtDeleteOlderThan: Statement<void, [number]>;

  constructor(db: Database) {
    super(db);
    this.stmtCreate = db.query<void, [string, string, string, string, string]>(
      'INSERT INTO messages (id, connector_token, sender_phone, body, wa_message_id) VALUES (?, ?, ?, ?, ?)',
    );
    this.stmtGetOldest = db.query<QueuedMessage, [string]>(
      'SELECT * FROM messages WHERE connector_token = ? ORDER BY queued_at ASC LIMIT 1',
    );
    this.stmtDeleteById = db.query<void, [string]>('DELETE FROM messages WHERE id = ?');
    this.stmtDeleteOlderThan = db.query<void, [number]>('DELETE FROM messages WHERE queued_at < ?');
  }

  create({
    connectorToken,
    senderPhone,
    body,
    waMessageId,
  }: {
    connectorToken: string;
    senderPhone: string;
    body: string;
    waMessageId: string;
  }): string {
    const id = Bun.randomUUIDv7();
    this.stmtCreate.run(id, connectorToken, senderPhone, body, waMessageId);
    return id;
  }

  deleteOldest({ connectorToken }: { connectorToken: string }): QueuedMessage | null {
    return this.db.transaction((): QueuedMessage | null => {
      const row = this.stmtGetOldest.get(connectorToken);
      if (!row) {
        return null;
      }
      this.stmtDeleteById.run(row.id);
      return row;
    })();
  }

  deleteOlderThan({ thresholdUnixSecs }: { thresholdUnixSecs: number }): number {
    this.stmtDeleteOlderThan.run(thresholdUnixSecs);
    return this.db.query<{ count: number }, []>('SELECT changes() AS count').get()?.count ?? 0;
  }
}
