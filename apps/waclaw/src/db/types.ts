export type Route = {
  id: string;
  connector_token: string;
  sender_phone: string;
  created_at: number;
  last_polled_at: number | null;
};

export type QueuedMessage = {
  id: string;
  connector_token: string;
  sender_phone: string;
  body: string;
  wa_message_id: string;
  queued_at: number;
};
