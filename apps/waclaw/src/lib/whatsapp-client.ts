import { BadGatewayError } from '#lib/errors.ts';
import { toMetaFormat } from '#lib/phone.ts';

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

type SendTextOptions = {
  phoneNumberId: string;
  waToken: string;
  /** E.164 phone number (e.g. +12025550123). */
  to: string;
  text: string;
};

type SendReactionOptions = {
  phoneNumberId: string;
  waToken: string;
  /** E.164 phone number of the chat. */
  to: string;
  /** The message id to react to. */
  messageId: string;
  /** Emoji to react with. Empty string removes the reaction. */
  emoji: string;
};

type MetaTextMessageBody = {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text';
  text: { body: string };
};

type MetaReactionMessageBody = {
  messaging_product: 'whatsapp';
  to: string;
  type: 'reaction';
  reaction: { message_id: string; emoji: string };
};

type MetaMessageBody = MetaTextMessageBody | MetaReactionMessageBody;

export class WhatsAppClient {
  async sendText({ phoneNumberId, waToken, to, text }: SendTextOptions): Promise<void> {
    const body: MetaTextMessageBody = {
      messaging_product: 'whatsapp',
      to: toMetaFormat(to),
      type: 'text',
      text: { body: text },
    };
    await this.send(phoneNumberId, waToken, body);
  }

  async sendReaction({
    phoneNumberId,
    waToken,
    to,
    messageId,
    emoji,
  }: SendReactionOptions): Promise<void> {
    const body: MetaReactionMessageBody = {
      messaging_product: 'whatsapp',
      to: toMetaFormat(to),
      type: 'reaction',
      reaction: { message_id: messageId, emoji },
    };
    await this.send(phoneNumberId, waToken, body);
  }

  private async send(phoneNumberId: string, waToken: string, body: MetaMessageBody): Promise<void> {
    const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${waToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new BadGatewayError(`WhatsApp API error: ${response.status} ${response.statusText}`);
    }
  }
}
