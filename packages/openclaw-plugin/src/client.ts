import { edenFetch } from '@elysiajs/eden';
import type { App } from '@repo/waclaw/types';

const baseUrl = 'https://waclaw.onfabric.io';

export function createWaclawClient() {
  return edenFetch<App>(baseUrl);
}

export type WaclawClient = ReturnType<typeof createWaclawClient>;

export type PollResult = {
  sender_phone: string;
  body: string;
  wa_message_id: string;
  message_id: string;
};

export async function pollMessage(
  client: WaclawClient,
  connectorToken: string,
): Promise<PollResult | null> {
  const res = await client('/poll', { query: { token: connectorToken } });
  if (res.error) throw new Error(`waclaw poll failed: ${String(res.error)}`);
  const data = res.data;
  if (!data || ('message' in data && data.message === null)) return null;
  return data as PollResult;
}

export async function sendReply(
  client: WaclawClient,
  params: { connectorToken: string; text: string; messageId: string },
) {
  const res = await client('/reply', {
    method: 'POST',
    body: {
      connector_token: params.connectorToken,
      text: params.text,
      message_id: params.messageId,
    },
  });
  if (res.error) throw new Error(`waclaw reply failed: ${String(res.error)}`);
}

export async function healthCheck(client: WaclawClient) {
  const res = await client('/health', { method: 'GET' });
  if (res.error) throw new Error(`waclaw health check failed: ${String(res.error)}`);
  return res.data;
}
