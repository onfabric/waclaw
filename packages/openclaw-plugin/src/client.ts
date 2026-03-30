import { edenFetch } from '@elysiajs/eden';
import type { App } from '@repo/waclaw/types';

const baseUrl = 'https://waclaw.onfabric.io';

export function createWaclawClient() {
  return edenFetch<App>(baseUrl);
}

export type WaclawClient = ReturnType<typeof createWaclawClient>;

/**
 * edenFetch wraps errors in a custom class that extends Error, setting `message`
 * to `String(value)`. When `value` is an object, that produces "[object Object]".
 * This helper extracts a readable string from the inner `value` instead.
 */
export function formatEdenError(error: { status: number; value?: unknown }): string {
  const value = error.value;
  if (value instanceof Error) {
    return `status=${error.status} ${value.message}`;
  }
  if (value !== null) {
    return `status=${error.status} ${JSON.stringify(value)}`;
  }
  return `status=${error.status}`;
}

export { SendMessageTypeEnum } from '@repo/waclaw/types';
