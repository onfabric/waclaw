import type { ChannelSetupWizard } from 'openclaw/plugin-sdk/channel-setup';
import { createChannelPluginBase, createChatChannelPlugin } from 'openclaw/plugin-sdk/core';
import { formatEdenError } from '#client.ts';
import {
  applyAccountConfig,
  CHANNEL_ID,
  CHANNEL_NAME,
  getChannelSection,
  inspectAccount,
  isChannelConfigured,
  listAccountIds,
  resolveAccount,
} from '#config.ts';
import { getRuntime } from '#runtime.ts';

const setupWizard: ChannelSetupWizard = {
  channel: CHANNEL_ID,
  status: {
    configuredLabel: 'Connected to waclaw proxy',
    unconfiguredLabel: 'Not configured',
    resolveConfigured: ({ cfg }) => Boolean(getChannelSection(cfg)?.connectorToken),
  },
  credentials: [
    {
      inputKey: 'token',
      providerHint: CHANNEL_ID,
      credentialLabel: 'Connector token',
      preferredEnvVar: 'WACLAW_CONNECTOR_TOKEN',
      envPrompt: 'Use WACLAW_CONNECTOR_TOKEN from environment?',
      keepPrompt: 'Keep current connector token?',
      inputPrompt: 'Enter your waclaw connector token (from waclaw proxy admin API):',
      inspect: ({ cfg }) => {
        const token = getChannelSection(cfg)?.connectorToken;
        return {
          accountConfigured: Boolean(token),
          hasConfiguredValue: Boolean(token),
        };
      },
    },
  ],
};

const base = createChannelPluginBase({
  id: CHANNEL_ID,
  meta: {
    id: CHANNEL_ID,
    label: CHANNEL_NAME,
    selectionLabel: CHANNEL_NAME,
    blurb: 'Connect OpenClaw to WhatsApp via the waclaw proxy.',
  },
  capabilities: {
    chatTypes: ['direct'],
  },
  config: {
    listAccountIds,
    resolveAccount,
    inspectAccount,
    resolveDefaultTo: ({ cfg }) => getChannelSection(cfg)?.connectorToken,
    isConfigured: (_, cfg) => isChannelConfigured(cfg),
  },
  setup: {
    applyAccountConfig,
  },
  setupWizard,
});

export const waclawPlugin = createChatChannelPlugin({
  base: { ...base, capabilities: base.capabilities!, config: base.config! },
  security: {
    dm: {
      channelKey: CHANNEL_ID,
      resolvePolicy: () => undefined,
      resolveAllowFrom: () => [],
      defaultPolicy: 'allowlist',
    },
  },
  threading: { topLevelReplyToMode: 'reply' },
  outbound: {
    deliveryMode: 'direct',
    sendText: async (ctx) => {
      const runtime = getRuntime();
      const account = resolveAccount(ctx.cfg, ctx.accountId);
      if (!account.connectorToken) {
        throw new Error('waclaw: connectorToken is not configured');
      }

      const messageId = crypto.randomUUID();

      const res = await runtime.client('/send', {
        method: 'POST',
        body: {
          connector_token: account.connectorToken,
          text: ctx.text,
          message_id: messageId,
        },
      });

      if (res.error) {
        throw new Error(`waclaw send failed: ${formatEdenError(res.error)}`);
      }

      return { channel: CHANNEL_ID, messageId };
    },
  },
});
