import type { OpenClawPluginService, OpenClawPluginServiceContext } from 'openclaw/plugin-sdk/core';
import { resolveAccount } from '#config.ts';
import type { WaclawRuntime } from '#runtime.ts';

const POLL_ERROR_RETRY_INTERVAL_MS = 5000;

export function createWaclawService(runtime: WaclawRuntime): OpenClawPluginService {
  return {
    id: 'waclaw-poller',
    start(ctx) {
      ctx.logger.info('waclaw: starting poll loop');
      pollLoop(runtime, ctx);
    },
    stop(ctx) {
      runtime.isStopped = true;
      ctx.logger.info('waclaw: stopping poll loop');
    },
  };
}

async function pollLoop(runtime: WaclawRuntime, ctx: OpenClawPluginServiceContext) {
  const account = resolveAccount(ctx.config);
  const connectorToken = account.connectorToken;
  if (!connectorToken) {
    throw new Error('waclaw: connectorToken not found');
  }

  while (!runtime.isStopped) {
    try {
      const msg = await runtime.client('/poll', { query: { token: connectorToken } });
      if (msg.error) {
        throw new Error(`waclaw poll failed: ${String(msg.error)}`);
      }
      ctx.logger.info(`waclaw: received message from ${msg.data?.sender_phone}`);
      // TODO: dispatch inbound message to OpenClaw via the channel inbound pipeline.
      // See bundled channel plugins (extensions/msteams, extensions/googlechat)
      // and the ChannelGatewayAdapter.startAccount pattern for real examples.
    } catch (err) {
      ctx.logger.error(`waclaw: poll error: ${err}`);
      await new Promise((resolve) => setTimeout(resolve, POLL_ERROR_RETRY_INTERVAL_MS));
    }
  }
}
