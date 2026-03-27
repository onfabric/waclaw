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
  textInputs: [
    {
      // 'url' is used as the internal credentialValues tracking key;
      // the actual config write is handled by applySet below.
      inputKey: 'url',
      message: 'Default outbound phone number (E.164, e.g. +12025550123):',
      placeholder: '+12025550123',
      required: false,
      helpTitle: 'Default outbound recipient',
      helpLines: [
        'Used for native outbound sends that have no conversational context, e.g. cron announce.',
        'Must be full E.164 format with a leading "+" (e.g. +12025550123).',
        'Leave blank to skip — only needed if you use cron announcements.',
      ],
      keepPrompt: (value) => `Keep current defaultTo (${value})?`,
      currentValue: ({ cfg }) => getChannelSection(cfg)?.defaultTo,
      validate: ({ value }) => {
        if (value && !/^\+\d+$/.test(value)) {
          return 'Must be E.164 format with a leading "+" (e.g. +12025550123)';
        }
      },
      applySet: ({ cfg, accountId, value }) =>
        applyAccountConfig({ cfg, accountId, input: { defaultTo: value || undefined } }),
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
    resolveDefaultTo: ({ cfg }) => getChannelSection(cfg)?.defaultTo,
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
    deliveryMode: 'direct',
    sendText: async (ctx) => {
      const runtime = getRuntime();
      const account = resolveAccount(ctx.cfg, ctx.accountId);
      if (!account.connectorToken) {
        throw new Error('waclaw: connectorToken is not configured');
      }

      // Falls back to the configured defaultTo for context-free sends like cron announce.
      const to = ctx.to ?? account.defaultTo;
      if (!to) {
        throw new Error(
          'waclaw: no outbound target. Set channels.waclaw.defaultTo or ensure OpenClaw provides a target for this send.',
        );
      }

      const messageId = crypto.randomUUID();

      const res = await runtime.client('/send', {
        method: 'POST',
        body: {
          connector_token: account.connectorToken,
          to,
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
