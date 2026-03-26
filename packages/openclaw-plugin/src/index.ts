import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { configSchema, PLUGIN_ID, parseConfig } from '#/config';

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

    api.logger.info('waclaw: registered plugin');
  },
});
