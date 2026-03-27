import type { ChannelSetupWizard } from 'openclaw/plugin-sdk/channel-setup';
import { createChannelPluginBase, createChatChannelPlugin } from 'openclaw/plugin-sdk/core';
import { formatEdenError } from '#client.ts';
import {
  applyAccountConfig,
  CHANNEL_ID,
  getChannelSection,
  inspectAccount,
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
      inputPrompt: 'Enter your waclaw connector token (from POST /admin/routes):',
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
    label: 'WhatsApp (waclaw)',
    selectionLabel: 'WhatsApp via waclaw proxy',
    docsPath: '/channels/whatsapp',
    blurb: 'Connect OpenClaw to WhatsApp via the waclaw relay proxy.',
  },
  capabilities: {
    chatTypes: ['direct'],
  },
  config: {
    listAccountIds,
    resolveAccount,
    inspectAccount,
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
      resolvePolicy: (account) => account.dmPolicy,
      resolveAllowFrom: (account) => account.allowFrom,
      defaultPolicy: 'allowlist',
    },
  },
  threading: { topLevelReplyToMode: 'reply' },
  outbound: {
    base: {
      deliveryMode: 'direct',
    },
    attachedResults: {
      channel: CHANNEL_ID,
      sendText: async (ctx) => {
        const runtime = getRuntime();
        const account = resolveAccount(ctx.cfg, ctx.accountId);
        const messageId = crypto.randomUUID();

        const res = await runtime.client('/reply', {
          method: 'POST',
          body: {
            connector_token: account.connectorToken,
            text: ctx.text,
            message_id: messageId,
          },
        });

        if (res.error) {
          throw new Error(`waclaw reply failed: ${formatEdenError(res.error)}`);
        }

        return { messageId };
      },
    },
  },
});
