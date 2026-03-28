import { defineChannelPluginEntry } from 'openclaw/plugin-sdk/core';
import { waclawPlugin } from '#channel.ts';
import { registerCli } from '#cli/index.ts';
import { CHANNEL_DESCRIPTION, CHANNEL_ID, CHANNEL_NAME, isChannelConfigured } from '#config.ts';
import { createRuntime, getRuntime } from '#runtime.ts';
import { createWaclawService } from '#service.ts';

export default defineChannelPluginEntry({
  id: CHANNEL_ID,
  name: CHANNEL_NAME,
  description: CHANNEL_DESCRIPTION,
  plugin: waclawPlugin,
  registerFull(api) {
    registerCli(api);

    if (!isChannelConfigured(api.config)) {
      api.logger.info('waclaw: no connectorToken configured, skipping runtime setup');
      return;
    }

    createRuntime(api.runtime);
    const runtime = getRuntime();

    const service = createWaclawService(runtime);
    api.registerService(service);
  },
});
