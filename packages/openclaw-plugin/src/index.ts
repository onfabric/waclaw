import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { createWaclawClient } from '#client.ts';
import { configSchema, PLUGIN_ID, parseConfig } from '#config.ts';

export default definePluginEntry({
  id: PLUGIN_ID,
  name: 'waclaw',
  description: 'Send and receive messages from WhatsApp Business API',
  configSchema,
  register(api) {
    const cfg = parseConfig(api.pluginConfig);

    if (!cfg.relayToken) {
      api.logger.error('waclaw: relayToken is required');
      return;
    }

    const client = createWaclawClient('http://localhost:3000');
    client('/health', { method: 'GET' }).then((res) => {
      api.logger.info(`waclaw: health check: ${res.data?.status} (${res.data?.uptime}s)`);
    });

    api.logger.info('waclaw: registered plugin');
  },
});
