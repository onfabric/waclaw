import type { ChannelSetupWizard } from 'openclaw/plugin-sdk/channel-setup';
import { createChannelPluginBase, createChatChannelPlugin } from 'openclaw/plugin-sdk/core';
import { sendReply, type WaclawClient } from '#client.ts';
import {
  applyAccountConfig,
  CHANNEL_ID,
  getChannelSection,
  inspectAccount,
  listAccountIds,
  resolveAccount,
} from '#config.ts';

let _client: WaclawClient | undefined;

export function setClient(client: WaclawClient) {
  _client = client;
}

function getClient(): WaclawClient {
  if (!_client) {
    throw new Error('waclaw: client not initialized');
  }
  return _client;
}

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
        const account = resolveAccount(ctx.cfg, ctx.accountId);
        const messageId = crypto.randomUUID();

        await sendReply(getClient(), {
          connectorToken: account.connectorToken,
          text: ctx.text,
          messageId,
        });

        return { messageId };
      },
    },
  },
});
