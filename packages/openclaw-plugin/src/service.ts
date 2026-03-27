import { dispatchInboundDirectDmWithRuntime } from 'openclaw/plugin-sdk/channel-inbound';
import type { OpenClawPluginService, OpenClawPluginServiceContext } from 'openclaw/plugin-sdk/core';
import { formatEdenError } from '#client.ts';
import { CHANNEL_ID, resolveAccount } from '#config.ts';
import type { WaclawRuntime } from '#runtime.ts';

const REQUEST_TIMEOUT_408 = 408;
const SERVICE_UNAVAILABLE_503 = 503;

const POLL_ERROR_RETRY_INTERVAL_MS = 5000;
const CHANNEL_LABEL = 'WhatsApp (waclaw)';
// Must be longer than the server-side park timeout (30 s) so the server always
// gets the chance to respond with 408 before the client aborts.
const POLL_CLIENT_TIMEOUT_MS = 35_000;

function isPollTimeoutError(error: { status: number; value?: unknown }): boolean {
  // Server explicitly signalled no messages
  if (error.status === REQUEST_TIMEOUT_408) {
    return true;
  }
  // Network-level timeout: edenFetch catches the thrown exception and wraps it as status 503.
  // Node.js undici wraps abort errors one level deep:
  //   TypeError('fetch failed', { cause: DOMException { name: 'TimeoutError' } })
  // so we check both the outer error and its cause.
  if (error.status !== SERVICE_UNAVAILABLE_503) {
    return false;
  }
  const inner = error.value as Record<string, unknown> | null;
  const name = inner?.name;
  if (name === 'TimeoutError' || name === 'AbortError') {
    return true;
  }
  const causeName = (inner?.cause as Record<string, unknown> | null)?.name;
  return causeName === 'TimeoutError' || causeName === 'AbortError';
}

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
  const account = resolveAccount(ctx.config);
  const accountId = account.accountId ?? 'default';
  const connectorToken = account.connectorToken;
  if (!connectorToken) {
    throw new Error('waclaw: connectorToken not found');
  }

  while (!runtime.isStopped) {
    try {
      const { data, error } = await runtime.client('/poll', {
        query: { token: connectorToken },
        signal: AbortSignal.timeout(POLL_CLIENT_TIMEOUT_MS),
      });
      if (error) {
        if (isPollTimeoutError(error)) {
          ctx.logger.info('waclaw: poll timed out, continuing');
          continue;
        }
        throw new Error(`waclaw poll failed: ${formatEdenError(error)}`);
      }
      if (!data.sender_phone) {
        ctx.logger.warn(`waclaw: received message with missing sender_phone, skipping`);
        continue;
      }
      ctx.logger.info(`waclaw: received message from ${data.sender_phone}`);

      await dispatchInboundDirectDmWithRuntime({
        cfg: ctx.config,
        runtime: runtime.pluginRuntime,
        channel: CHANNEL_ID,
        channelLabel: CHANNEL_LABEL,
        accountId,
        peer: { kind: 'direct', id: data.sender_phone },
        senderId: data.sender_phone,
        senderAddress: data.sender_phone,
        recipientAddress: accountId,
        conversationLabel: data.sender_phone,
        rawBody: data.body,
        messageId: data.wa_message_id,
        deliver: async (payload) => {
          if (payload.text) {
            const { error } = await runtime.client('/reply', {
              method: 'POST',
              body: {
                connector_token: connectorToken,
                text: payload.text,
                message_id: data.wa_message_id,
              },
            });
            if (error) {
              throw new Error(`waclaw reply failed: ${formatEdenError(error)}`);
            }
          }
        },
        onRecordError: (err) => ctx.logger.error(`waclaw: session record error: ${err}`),
        onDispatchError: (err, info) =>
          ctx.logger.error(`waclaw: dispatch error [${info.kind}]: ${err}`),
      });
    } catch (err) {
      ctx.logger.error(`waclaw: poll error: ${err}`);
      await new Promise((resolve) => setTimeout(resolve, POLL_ERROR_RETRY_INTERVAL_MS));
    }
  }
}
