import { edenFetch } from '@elysiajs/eden';
import type { App } from '@repo/waclaw/types';

export function createWaclawClient(baseUrl: string) {
  return edenFetch<App>(baseUrl);
}
