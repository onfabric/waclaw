CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  connector_token TEXT NOT NULL REFERENCES routes(connector_token) ON DELETE CASCADE,
  sender_phone    TEXT NOT NULL,
  body            TEXT NOT NULL,
  wa_message_id   TEXT NOT NULL,
  queued_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
