import { readFile } from 'node:fs/promises';
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
import { resolveAudioMimeType } from '#media.ts';
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
  // Without this override, core's default extractToolSend reads the "to" param
  // from the agent's tool call and tries to resolve it as a recipient — which
  // fails for react since there's no recipient, only a messageId. Returning null
  // skips target resolution and routes straight to handleAction.
  extractToolSend: () => null,
  handleAction: async (ctx) => {
    console.info(
      `waclaw: handleAction called action=${ctx.action} params=${JSON.stringify(ctx.params)}`,
    );

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
      console.warn('waclaw: react called without messageId');
      return { content: [{ type: 'text', text: 'Missing messageId for reaction' }], details: {} };
    }

    console.info(`waclaw: sending reaction emoji=${emoji} messageId=${messageId}`);

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

    if (emoji) {
      runtime.agentReactedMessageIds.add(messageId);
      console.info(`waclaw: tracked agent reaction for messageId=${messageId}`);
    }

    const result = emoji ? `Reacted with ${emoji}` : 'Removed reaction';
    console.info(`waclaw: handleAction completed — ${result} on messageId=${messageId}`);
    return { content: [{ type: 'text', text: result }], details: {} };
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
  agentPrompt: {
    messageToolHints: () => [
      '- You can react to WhatsApp messages with any emoji. React like a human would — to laugh, agree, show love, or vibe with something without needing to type a whole reply. Keep it spontaneous and fun, not robotic.',
      "- React to the user while you work to keep them engaged — don't leave them hanging in silence. A quick reaction shows you're there and paying attention.",
    ],
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
  base: {
    ...base,
    capabilities: base.capabilities!,
    config: base.config!,
    actions,
    // Core runs resolveActionTarget for all message tool actions — including react.
    // Without a targetResolver, any "to" value the agent passes (e.g. "default")
    // fails directory lookup. Since waclaw is DM-only and react targets a messageId
    // (not a recipient), we accept any input as-is.
    messaging: {
      targetResolver: {
        resolveTarget: async ({ input }) => ({ to: input, kind: 'user' }),
      },
    },
  },
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
    sendMedia: async (ctx) => {
      const runtime = getRuntime();
      const account = resolveAccount(ctx.cfg, ctx.accountId);
      if (!account.connectorToken) {
        throw new Error('waclaw: connectorToken is not configured');
      }

      const mediaUrl = ctx.mediaUrl;
      if (!mediaUrl) {
        throw new Error('waclaw: sendMedia called without mediaUrl');
      }

      const mimeType = resolveAudioMimeType(mediaUrl);
      if (!mimeType) {
        // Not an audio file — fall back to sending just the text caption
        if (ctx.text) {
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
        }
        throw new Error(`waclaw: unsupported media type for ${mediaUrl}`);
      }

      const fileBuffer = await readFile(mediaUrl);
      const base64Data = fileBuffer.toString('base64');
      const messageId = crypto.randomUUID();

      const res = await runtime.client('/send', {
        method: 'POST',
        body: {
          type: SendMessageTypeEnum.audio,
          connector_token: account.connectorToken,
          base64_data: base64Data,
          mime_type: mimeType,
          message_id: messageId,
        },
      });

      if (res.error) {
        throw new Error(`waclaw sendMedia failed: ${formatEdenError(res.error)}`);
      }

      // If there's a text caption, send it as a follow-up text message
      if (ctx.text) {
        const textRes = await runtime.client('/send', {
          method: 'POST',
          body: {
            type: SendMessageTypeEnum.text,
            connector_token: account.connectorToken,
            text: ctx.text,
          },
        });
        if (textRes.error) {
          throw new Error(`waclaw send caption failed: ${formatEdenError(textRes.error)}`);
        }
      }

      return { channel: CHANNEL_ID, messageId };
    },
  },
});
