import { env } from '#lib/env.ts';
import { WhatsAppClient } from '#lib/whatsapp-client.ts';
import { Service } from '#services/service.ts';

export class WhatsAppService extends Service {
  private readonly client = new WhatsAppClient();

  async sendText({ to, text }: { to: string; text: string }): Promise<void> {
    await this.client.sendText({
      phoneNumberId: env.metaPhoneNumberId,
      waToken: env.metaAccessToken,
      to,
      text,
    });
  }
}
