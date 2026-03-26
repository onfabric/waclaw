export type Route = {
  id: string;
  connector_token: string;
  phone_number_id: string;
  created_at: number;
};

export type QueuedMessage = {
  id: string;
  connector_token: string;
  sender_phone: string;
  body: string;
  wa_message_id: string;
  queued_at: number;
};
