import { dispatchInboundDirectDmWithRuntime } from 'openclaw/plugin-sdk/channel-inbound';
import type { OpenClawPluginService, OpenClawPluginServiceContext } from 'openclaw/plugin-sdk/core';
import { formatEdenError, SendMessageTypeEnum } from '#client.ts';
import { CHANNEL_ID, CHANNEL_NAME, resolveAccount } from '#config.ts';
import { AckEmoji } from '#emoji.ts';
import {
  readMediaFile,
  resolveMediaSendType,
  sanitizeMediaUrl,
  writeMediaToTempFile,
} from '#media.ts';
import { maybeSendAckReaction, sendRemoveReaction, startThinkingReactions } from '#reactions.ts';
import type { WaclawRuntime } from '#runtime.ts';

const SECONDS_TO_MILLISECONDS = 1000;

const HTTP_STATUS_REQUEST_TIMEOUT_408 = 408;

const POLL_ERROR_RETRY_INTERVAL_SECONDS = 5;
const POLL_ERROR_RETRY_INTERVAL_MS = POLL_ERROR_RETRY_INTERVAL_SECONDS * SECONDS_TO_MILLISECONDS;
// Must be longer than the server-side park timeout (30 s) so the server always
// gets the chance to respond with 408 before the client aborts.
const POLL_CLIENT_TIMEOUT_MS = 35 * SECONDS_TO_MILLISECONDS;

const CONFIGURE_PLUGIN_HINT = 'run `openclaw configure` to set it up, then restart the gateway';

export function createWaclawService(runtime: WaclawRuntime): OpenClawPluginService {
  return {
    id: 'waclaw-poller',
    start(ctx) {
      ctx.logger.info('waclaw: starting poll loop');
      pollLoop(runtime, ctx);
    },
    stop(ctx) {
      runtime.isStopped = true;
      ctx.logger.info('waclaw: stopping poll loop');
    },
  };
}

async function pollLoop(runtime: WaclawRuntime, ctx: OpenClawPluginServiceContext) {
  let account: ReturnType<typeof resolveAccount>;
  try {
    account = resolveAccount(ctx.config);
  } catch {
    ctx.logger.error(`waclaw: connectorToken is not configured — ${CONFIGURE_PLUGIN_HINT}`);
    return;
  }
  const accountId = account.accountId ?? 'default';
  const connectorToken = account.connectorToken;
  if (!connectorToken) {
    ctx.logger.error(`waclaw: connectorToken is not configured — ${CONFIGURE_PLUGIN_HINT}`);
    return;
  }

  ctx.logger.info(`waclaw: starting poll loop. account_id=${accountId}`);

  while (!runtime.isStopped) {
    try {
      const { data, error } = await runtime.client('/poll', {
        query: { token: connectorToken },
        signal: AbortSignal.timeout(POLL_CLIENT_TIMEOUT_MS),
      });
      if (error) {
        if (error.status === HTTP_STATUS_REQUEST_TIMEOUT_408) {
          ctx.logger.info('waclaw: poll timed out, continuing');
          continue;
        }
        throw new Error(`Poll failed: ${formatEdenError(error)}`);
      }
      if (!data.sender_phone) {
        ctx.logger.warn(`waclaw: received message with missing sender_phone, skipping`);
        continue;
      }

      let messageContent = data.body;

      ctx.logger.info(
        `waclaw: received message from ${data.sender_phone} (body length: ${data.body.length})`,
      );

      let extraContext: Record<string, unknown> | undefined;
      if (data.media) {
        ctx.logger.info(`waclaw: message has media (mime type: ${data.media.mime_type})`);
        try {
          const mediaPath = await writeMediaToTempFile({
            base64Data: data.media.base64Data,
            mimeType: data.media.mime_type,
          });
          messageContent = messageContent || '[media]';
          extraContext = {
            MediaPath: mediaPath,
            MediaType: data.media!.mime_type,
          };
          ctx.logger.info(`waclaw: wrote media to ${mediaPath}`);
        } catch (err) {
          ctx.logger.error(`waclaw: failed to write media to temp file: ${err}`);
        }
      }

      const mediaMime = data.media?.mime_type;
      const ackEmoji = mediaMime?.startsWith('audio/')
        ? AckEmoji.Audio
        : mediaMime?.startsWith('image/')
          ? AckEmoji.Image
          : AckEmoji.Default;

      const { sendPromise: ackSent } = maybeSendAckReaction({
        runtime,
        cfg: ctx.config,
        connectorToken,
        waMessageId: data.wa_message_id,
        emoji: ackEmoji,
        logger: ctx.logger,
      });

      const { stopThinkingReactions } = startThinkingReactions({
        runtime,
        connectorToken,
        waMessageId: data.wa_message_id,
        logger: ctx.logger,
        startTimerAfterPromise: ackSent,
      });

      await dispatchInboundDirectDmWithRuntime({
        cfg: ctx.config,
        runtime: runtime.pluginRuntime,
        channel: CHANNEL_ID,
        channelLabel: CHANNEL_NAME,
        accountId,
        peer: { kind: 'direct', id: data.sender_phone },
        senderId: data.sender_phone,
        senderAddress: data.sender_phone,
        recipientAddress: accountId,
        conversationLabel: data.sender_phone,
        rawBody: messageContent,
        messageId: data.wa_message_id,
        ...(extraContext && { extraContext }),
        deliver: async (payload) => {
          const rawMediaUrl = payload.mediaUrl ?? payload.mediaUrls?.[0];
          const mediaUrl = rawMediaUrl ? sanitizeMediaUrl(rawMediaUrl) : undefined;
          if (!payload.text && !mediaUrl) {
            ctx.logger.warn(
              `waclaw: deliver called for ${data.sender_phone} with no text and no media, skipping`,
            );
            return;
          }

          stopThinkingReactions();

          // Remove ack/thinking reaction before sending the reply — unless the
          // agent already reacted (its emoji replaced the ack on WhatsApp).
          const hasAgentReacted = runtime.agentReactedMessageIds.delete(data.wa_message_id);
          if (!hasAgentReacted) {
            sendRemoveReaction({ runtime, connectorToken, waMessageId: data.wa_message_id }).catch(
              (err) => ctx.logger.warn(`waclaw: remove ack reaction failed: ${err}`),
            );
          }

          let captionSent = false;
          if (mediaUrl) {
            const media = await readMediaFile(mediaUrl);
            if (media) {
              const sendType = resolveMediaSendType(media.mimeType);
              if (!sendType) {
                ctx.logger.warn(
                  `waclaw: unsupported media mime type ${media.mimeType}, skipping media`,
                );
                return;
              }
              const messageId = payload.replyToId || data.wa_message_id;
              switch (sendType) {
                case SendMessageTypeEnum.image: {
                  const { error } = await runtime.client('/send', {
                    method: 'POST',
                    body: {
                      type: SendMessageTypeEnum.image,
                      connector_token: connectorToken,
                      base64_data: media.base64Data,
                      mime_type: media.mimeType,
                      caption: payload.text,
                      message_id: messageId,
                    },
                  });
                  if (error) {
                    throw new Error(`Deliver image failed: ${formatEdenError(error)}`);
                  }
                  captionSent = Boolean(payload.text);
                  break;
                }
                case SendMessageTypeEnum.audio: {
                  const { error } = await runtime.client('/send', {
                    method: 'POST',
                    body: {
                      type: SendMessageTypeEnum.audio,
                      connector_token: connectorToken,
                      base64_data: media.base64Data,
                      mime_type: media.mimeType,
                      message_id: messageId,
                    },
                  });
                  if (error) {
                    throw new Error(`Deliver audio failed: ${formatEdenError(error)}`);
                  }
                  break;
                }
              }
              ctx.logger.info(
                `waclaw: delivered ${sendType} to ${data.sender_phone} (mime: ${media.mimeType})`,
              );
            } else {
              ctx.logger.warn(`waclaw: unsupported media type for ${mediaUrl}, skipping media`);
            }
          }

          if (payload.text && !captionSent) {
            const { error } = await runtime.client('/send', {
              method: 'POST',
              body: {
                type: SendMessageTypeEnum.text,
                connector_token: connectorToken,
                text: payload.text,
                message_id: payload.replyToId || data.wa_message_id,
              },
            });
            if (error) {
              throw new Error(`Deliver failed: ${formatEdenError(error)}`);
            }
            ctx.logger.info(
              `waclaw: delivered text to ${data.sender_phone} (length: ${payload.text.length})`,
            );
          }
        },
        onRecordError: (err) => {
          stopThinkingReactions();
          ctx.logger.error(`waclaw: session record error: ${err}`);
        },
        onDispatchError: (err, info) => {
          stopThinkingReactions();
          ctx.logger.error(`waclaw: dispatch error [${info.kind}]: ${err}`);
        },
      });
    } catch (err) {
      ctx.logger.error(
        `waclaw: poll error: ${err}. Retrying in ${POLL_ERROR_RETRY_INTERVAL_SECONDS}s...`,
      );
      await new Promise((resolve) => setTimeout(resolve, POLL_ERROR_RETRY_INTERVAL_MS));
    }
  }
}
