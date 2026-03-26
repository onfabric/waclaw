CREATE TABLE IF NOT EXISTS routes (
  id              TEXT PRIMARY KEY,
  connector_token TEXT UNIQUE NOT NULL,
  phone_number_id TEXT UNIQUE NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
