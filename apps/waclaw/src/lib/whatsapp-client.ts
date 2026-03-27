import { BadGatewayError } from '#lib/errors.ts';
import { toMetaFormat } from '#lib/phone.ts';

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

type SendTextOptions = {
  phoneNumberId: string;
  waToken: string;
  /** E.164 phone number (e.g. +12025550123). The leading '+' is stripped before sending to Meta. */
  to: string;
  text: string;
};

export class WhatsAppClient {
  async sendText({ phoneNumberId, waToken, to, text }: SendTextOptions): Promise<void> {
    const normalizedTo = toMetaFormat(to);
    const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${waToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedTo,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!response.ok) {
      throw new BadGatewayError(`WhatsApp API error: ${response.status} ${response.statusText}`);
    }
  }
}
