import { edenFetch } from '@elysiajs/eden';
import type { App } from '@repo/waclaw/types';

const baseUrl = 'https://waclaw.onfabric.io';

export function createWaclawClient() {
  return edenFetch<App>(baseUrl);
}

export type WaclawClient = ReturnType<typeof createWaclawClient>;
