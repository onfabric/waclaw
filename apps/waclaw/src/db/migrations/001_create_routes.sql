CREATE TABLE IF NOT EXISTS routes (
  id              TEXT PRIMARY KEY,
  connector_token TEXT UNIQUE NOT NULL,
  phone_number_id TEXT UNIQUE NOT NULL,
  wa_token        TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
