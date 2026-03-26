import { env } from '#lib/env.ts';
import { WhatsAppClient } from '#lib/whatsapp-client.ts';
import { Service } from '#services/service.ts';

export class WhatsAppService extends Service {
  private readonly client = new WhatsAppClient();

  async sendText({
    phoneNumberId,
    to,
    text,
  }: {
    phoneNumberId: string;
    to: string;
    text: string;
  }): Promise<void> {
    await this.client.sendText({ phoneNumberId, waToken: env.metaAccessToken, to, text });
  }
}
