import type { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import { toMetaFormat } from '#lib/phone.ts';
import { Service } from '#services/service.ts';

/**
 * According to the MIME spec (https://www.rfc-editor.org/rfc/rfc2046#section-4.5.1),
 * this is the mime type to use for unknown file types.
 */
const UNKNOWN_MIME_TYPE = 'application/octet-stream';

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

export type MediaDownload = {
  data: Buffer;
  mimeType: string;
};

export class WhatsAppService extends Service {
  constructor(
    private whatsappClient: WhatsAppClient,
    private metaPhoneNumberId: string,
  ) {
    super();
  }

  async downloadMedia({ mediaId }: { mediaId: string }): Promise<MediaDownload> {
    const response = (await this.whatsappClient.media.download({
      mediaId,
      as: 'response',
    })) as Response;
    const data = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type') ?? UNKNOWN_MIME_TYPE;
    return { data, mimeType };
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
