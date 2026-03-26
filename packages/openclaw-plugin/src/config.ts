import type { OpenClawPluginConfigSchema } from 'openclaw/plugin-sdk';

/**
 * The ID of the plugin as declared in the `openclaw.plugin.json` file.
 */
export const PLUGIN_ID = 'waclaw';

type FabricPluginConfig = {
  relayToken: string;
};

export function parseConfig(raw: unknown): FabricPluginConfig {
  const cfg =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

  return {
    relayToken: cfg.relayToken as string,
  };
}

export const configSchema: OpenClawPluginConfigSchema = {
  jsonSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      relayToken: { type: 'string' },
    },
  },
  parse: parseConfig,
};
