import type { OpenClawConfig, OpenClawPluginServiceContext } from 'openclaw/plugin-sdk/core';
import { formatEdenError, SendMessageTypeEnum } from '#client.ts';
import { type AckEmoji, ThinkingEmojiPicker } from '#emoji.ts';
import type { WaclawRuntime } from '#runtime.ts';

const SECONDS_TO_MILLISECONDS = 1000;
const THINKING_REACTION_INTERVAL_MS = 5 * SECONDS_TO_MILLISECONDS;

type AckReactionResult = {
  sendPromise: Promise<boolean>;
};

export function maybeSendAckReaction(params: {
  runtime: WaclawRuntime;
  cfg: OpenClawConfig;
  connectorToken: string;
  waMessageId: string;
  emoji: AckEmoji;
  logger: OpenClawPluginServiceContext['logger'];
}): AckReactionResult {
  params.logger.info(
    `waclaw: sending ack reaction ${params.emoji} for message ${params.waMessageId}`,
  );

  const sendPromise = params.runtime
    .client('/send', {
      method: 'POST',
      body: {
        type: SendMessageTypeEnum.reaction,
        connector_token: params.connectorToken,
        wa_message_id: params.waMessageId,
        emoji: params.emoji,
      },
    })
    .then(({ error }) => {
      if (error) {
        params.logger.warn(`waclaw: ack reaction failed: ${formatEdenError(error)}`);
        return false;
      }
      return true;
    })
    .catch((err) => {
      params.logger.warn(`waclaw: ack reaction failed: ${err}`);
      return false;
    });

  return { sendPromise };
}

export async function sendRemoveReaction(params: {
  runtime: WaclawRuntime;
  connectorToken: string;
  waMessageId: string;
}): Promise<void> {
  await params.runtime
    .client('/send', {
      method: 'POST',
      body: {
        type: SendMessageTypeEnum.reaction,
        connector_token: params.connectorToken,
        wa_message_id: params.waMessageId,
        emoji: '',
      },
    })
    .then(({ error }) => {
      if (error) {
        throw new Error(formatEdenError(error));
      }
    });
}

export function startThinkingReactions(params: {
  runtime: WaclawRuntime;
  connectorToken: string;
  waMessageId: string;
  logger: OpenClawPluginServiceContext['logger'];
  startTimerAfterPromise?: Promise<unknown>;
}): { stopThinkingReactions: () => void } {
  let timer: ReturnType<typeof setInterval> | undefined;
  let stopped = false;
  const picker = new ThinkingEmojiPicker();

  function sendThinkingReaction() {
    const emoji = picker.pick();

    params.logger.info(
      `waclaw: sending thinking reaction ${emoji} for message ${params.waMessageId}`,
    );
    params.runtime
      .client('/send', {
        method: 'POST',
        body: {
          type: SendMessageTypeEnum.reaction,
          connector_token: params.connectorToken,
          wa_message_id: params.waMessageId,
          emoji,
        },
      })
      .then(({ error }) => {
        if (error) {
          params.logger.error(
            `waclaw: thinking reaction failed. Error from api: ${formatEdenError(error)}`,
          );
        }
      })
      .catch((err) => {
        params.logger.error(`waclaw: thinking reaction failed. Error from client: ${err}`);
      });
  }

  function startInterval() {
    if (stopped) {
      return;
    }
    timer = setInterval(sendThinkingReaction, THINKING_REACTION_INTERVAL_MS);
  }

  if (params.startTimerAfterPromise) {
    params.startTimerAfterPromise.then(startInterval, startInterval);
  } else {
    startInterval();
  }

  return {
    stopThinkingReactions: () => {
      stopped = true;
      if (timer) {
        clearInterval(timer);
      }
    },
  };
}
