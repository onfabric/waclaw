import type { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import { toMetaFormat } from '#lib/phone.ts';
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
  constructor(
    private whatsappClient: WhatsAppClient,
    private metaPhoneNumberId: string,
  ) {
    super();
  }

  async sendMessage(message: SendMessageOptions): Promise<void> {
    const to = toMetaFormat(message.to);

    switch (message.type) {
      case 'text':
        await this.whatsappClient.messages.sendText({
          phoneNumberId: this.metaPhoneNumberId,
          to,
          body: message.text,
        });
        break;
      case 'reaction':
        await this.whatsappClient.messages.sendReaction({
          phoneNumberId: this.metaPhoneNumberId,
          to,
          reaction: { messageId: message.messageId, emoji: message.emoji },
        });
        break;
    }
  }
}
