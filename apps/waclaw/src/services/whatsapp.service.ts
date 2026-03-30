import { env } from '#lib/env.ts';
import { WhatsAppClient } from '#lib/whatsapp-client.ts';
import { Service } from '#services/service.ts';

type SendTextMessage = {
  type: 'text';
  to: string;
  text: string;
};

type SendReactionMessage = {
  type: 'reaction';
  to: string;
  messageId: string;
  emoji: string;
};

export type SendMessageOptions = SendTextMessage | SendReactionMessage;

export class WhatsAppService extends Service {
  private readonly client = new WhatsAppClient();

  async sendMessage(message: SendMessageOptions): Promise<void> {
    const credentials = {
      phoneNumberId: env.metaPhoneNumberId,
      waToken: env.metaAccessToken,
    };

    switch (message.type) {
      case 'text':
        await this.client.sendText({ ...credentials, to: message.to, text: message.text });
        break;
      case 'reaction':
        await this.client.sendReaction({
          ...credentials,
          to: message.to,
          messageId: message.messageId,
          emoji: message.emoji,
        });
        break;
    }
  }
}
