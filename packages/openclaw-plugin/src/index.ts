import { defineChannelPluginEntry } from 'openclaw/plugin-sdk/core';
import { waclawPlugin } from '#channel.ts';
import { CHANNEL_ID, getChannelSection } from '#config.ts';
import { createRuntime, getRuntime } from '#runtime.ts';
import { createWaclawService } from '#service.ts';

export default defineChannelPluginEntry({
  id: CHANNEL_ID,
  name: 'WhatsApp (waclaw)',
  description: 'WhatsApp channel plugin via waclaw proxy',
  plugin: waclawPlugin,
  registerFull(api) {
    const channelConfig = getChannelSection(api.config);
    if (!channelConfig?.connectorToken) {
      api.logger.info('waclaw: no connectorToken configured, skipping runtime setup');
      return;
    }

    createRuntime(api.runtime);
    const runtime = getRuntime();

    const service = createWaclawService(runtime);
    api.registerService(service);
  },
});
