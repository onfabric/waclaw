import type { ChannelMessageActionName } from 'openclaw/plugin-sdk';
import type { ChannelSetupWizard } from 'openclaw/plugin-sdk/channel-setup';
import {
  type ChannelPlugin,
  createChannelPluginBase,
  createChatChannelPlugin,
} from 'openclaw/plugin-sdk/core';
import { formatEdenError, SendMessageTypeEnum } from '#client.ts';
import {
  applyAccountConfig,
  CHANNEL_ID,
  CHANNEL_NAME,
  getChannelSection,
  inspectAccount,
  listAccountIds,
  resolveAccount,
} from '#config.ts';
import { getRuntime } from '#runtime.ts';

const SUPPORTED_ACTIONS: ChannelMessageActionName[] = ['react'];

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

const actions: NonNullable<ChannelPlugin['actions']> = {
  describeMessageTool: () => {
    return { actions: SUPPORTED_ACTIONS };
  },
  supportsAction: ({ action }) => {
    return SUPPORTED_ACTIONS.includes(action);
  },
  handleAction: async (ctx) => {
    if (ctx.action !== 'react') {
      return {
        content: [{ type: 'text', text: `Unsupported action: ${ctx.action}` }],
        details: {},
      };
    }

    const runtime = getRuntime();
    const account = resolveAccount(ctx.cfg, ctx.accountId);
    if (!account.connectorToken) {
      throw new Error('waclaw: connectorToken is not configured');
    }

    const params: { messageId?: string; emoji?: string } = ctx.params;
    const messageId = params.messageId;
    const emoji = params.emoji ?? '';

    if (!messageId) {
      return { content: [{ type: 'text', text: 'Missing messageId for reaction' }], details: {} };
    }

    const res = await runtime.client('/send', {
      method: 'POST',
      body: {
        type: SendMessageTypeEnum.reaction,
        connector_token: account.connectorToken,
        wa_message_id: messageId,
        emoji,
      },
    });

    if (res.error) {
      throw new Error(`waclaw react failed: ${formatEdenError(res.error)}`);
    }

    const action = emoji ? `Reacted with ${emoji}` : 'Removed reaction';
    return { content: [{ type: 'text', text: action }], details: {} };
  },
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
    reactions: true,
  },
  config: {
    listAccountIds,
    resolveAccount,
    inspectAccount,
    resolveDefaultTo: ({ cfg }) => getChannelSection(cfg)?.connectorToken,
  },
  setup: {
    applyAccountConfig,
  },
  setupWizard,
});

export const waclawPlugin = createChatChannelPlugin({
  base: { ...base, capabilities: base.capabilities!, config: base.config!, actions },
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
          type: SendMessageTypeEnum.text,
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
