import { defineChannelPluginEntry } from 'openclaw/plugin-sdk/core';
import { setClient, waclawPlugin } from '#channel.ts';
import { createWaclawClient, healthCheck, pollMessage, type WaclawClient } from '#client.ts';
import { CHANNEL_ID, resolveAccount } from '#config.ts';

export default defineChannelPluginEntry({
  id: CHANNEL_ID,
  name: 'WhatsApp (waclaw)',
  description: 'WhatsApp channel plugin via waclaw proxy',
  plugin: waclawPlugin,

  registerFull(api) {
    const account = resolveAccount(api.config);
    const client = createWaclawClient();
    setClient(client);

    healthCheck(client)
      .then((h) => api.logger.info(`waclaw: proxy health ${h?.status} (uptime ${h?.uptime}s)`))
      .catch((err) => api.logger.warn(`waclaw: proxy health check failed: ${err}`));

    let stopped = false;

    api.registerService({
      id: 'waclaw-poller',
      start() {
        api.logger.info('waclaw: starting poll loop');
        pollLoop(client, account.connectorToken, () => stopped, api.logger);
      },
      stop() {
        stopped = true;
        api.logger.info('waclaw: stopping poll loop');
      },
    });
  },
});

type Logger = { info: (msg: string) => void; error: (msg: string) => void };

async function pollLoop(
  client: WaclawClient,
  connectorToken: string,
  isStopped: () => boolean,
  logger: Logger,
) {
  while (!isStopped()) {
    try {
      const msg = await pollMessage(client, connectorToken);
      if (msg) {
        logger.info(`waclaw: received message from ${msg.sender_phone}`);
        // TODO: dispatch inbound message to OpenClaw via the channel inbound pipeline.
        // See bundled channel plugins (extensions/msteams, extensions/googlechat)
        // and the ChannelGatewayAdapter.startAccount pattern for real examples.
      }
    } catch (err) {
      logger.error(`waclaw: poll error: ${err}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
