CREATE TABLE IF NOT EXISTS routes (
  id              TEXT PRIMARY KEY,
  connector_token TEXT UNIQUE NOT NULL,
  sender_phone    TEXT UNIQUE NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
