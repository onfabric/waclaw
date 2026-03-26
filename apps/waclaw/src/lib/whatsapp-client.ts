import { BadGatewayError } from '#lib/errors.ts';

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

export class WhatsAppClient {
  async sendText({
    phoneNumberId,
    waToken,
    to,
    text,
  }: {
    phoneNumberId: string;
    waToken: string;
    to: string;
    text: string;
  }): Promise<void> {
    const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${waToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!response.ok) {
      throw new BadGatewayError(`WhatsApp API error: ${response.status} ${response.statusText}`);
    }
  }
}
