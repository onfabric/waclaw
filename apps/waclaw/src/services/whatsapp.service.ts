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

type SendAudioMessage = {
  type: 'audio';
  to: string;
  base64Data: string;
  mimeType: string;
};

type SendImageMessage = {
  type: 'image';
  to: string;
  base64Data: string;
  mimeType: string;
};

export type SendMessageOptions =
  | SendTextMessage
  | SendReactionMessage
  | SendAudioMessage
  | SendImageMessage;

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

  async downloadMedia({
    mediaId,
    mimeType: hintMimeType,
  }: {
    mediaId: string;
    mimeType?: string;
  }): Promise<MediaDownload> {
    const response = (await this.whatsappClient.media.download({
      mediaId,
      as: 'response',
      auth: 'always',
    })) as Response;
    if (!response.ok) {
      throw new Error(`media download failed: ${response.status} ${response.statusText}`);
    }
    const data = Buffer.from(await response.arrayBuffer());
    const mimeType = hintMimeType ?? response.headers.get('content-type') ?? UNKNOWN_MIME_TYPE;
    return { data, mimeType };
  }

  private async uploadMedia({
    base64Data,
    mimeType,
  }: {
    base64Data: string;
    mimeType: string;
  }): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');
    const file = new File([buffer], 'media', { type: mimeType });

    const { id } = await this.whatsappClient.media.upload({
      phoneNumberId: this.metaPhoneNumberId,
      type: mimeType,
      file,
    });
    return id;
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
      case 'audio': {
        const mediaId = await this.uploadMedia({
          base64Data: message.base64Data,
          mimeType: message.mimeType,
        });
        await this.whatsappClient.messages.sendAudio({
          phoneNumberId: this.metaPhoneNumberId,
          to,
          audio: { id: mediaId },
        });
        break;
      }
      case 'image': {
        const mediaId = await this.uploadMedia({
          base64Data: message.base64Data,
          mimeType: message.mimeType,
        });
        await this.whatsappClient.messages.sendImage({
          phoneNumberId: this.metaPhoneNumberId,
          to,
          image: { id: mediaId },
        });
        break;
      }
    }
  }
}
