import type { normalizeWebhook } from '@kapso/whatsapp-cloud-api/server';
import { env } from '#lib/env.ts';
import { logger } from '#lib/logger.ts';
import { normalizeToE164 } from '#lib/phone.ts';
import type { MessageService } from '#services/message.service.ts';
import { Service } from '#services/service.ts';
import type { WhatsAppService } from '#services/whatsapp.service.ts';

export class WebhookService extends Service {
  private readonly messageService: MessageService;
  private readonly whatsappService: WhatsAppService;

  constructor(messageService: MessageService, whatsappService: WhatsAppService) {
    super();
    this.messageService = messageService;
    this.whatsappService = whatsappService;
  }

  async processIncomingPayload(payload: ReturnType<typeof normalizeWebhook>): Promise<void> {
    if (payload.phoneNumberId !== env.metaPhoneNumberId) {
      if (payload.phoneNumberId) {
        logger.warn(`Ignoring webhook for unknown phone_number_id=${payload.phoneNumberId}`);
      }
      return;
    }

    for (const msg of payload.messages) {
      if (!msg.from) continue;
      const senderPhone = normalizeToE164(msg.from);

      if (msg.type === 'text' && msg.text?.body) {
        logger.info(
          `Received text from=${senderPhone} wa_message_id=${msg.id} length=${msg.text.body.length}`,
        );
        await this.messageService.handleIncoming({
          waMessageId: msg.id,
          senderPhone,
          body: msg.text.body,
        });
      } else if (msg.type === 'image' && msg.image?.id) {
        logger.info(
          `Received image from=${senderPhone} media_id=${msg.image.id} mime_type=${msg.image.mime_type ?? 'unknown'}`,
        );
        try {
          const webhookMimeType = msg.image.mime_type as string | undefined;
          const download = await this.whatsappService.downloadMedia({
            mediaId: msg.image.id,
            mimeType: webhookMimeType,
          });
          logger.info(
            `Downloaded image media_id=${msg.image.id} size=${download.data.length} mime_type=${download.mimeType}`,
          );
          await this.messageService.handleIncoming({
            waMessageId: msg.id,
            senderPhone,
            body: msg.image.caption ?? '',
            media: {
              mimeType: download.mimeType,
              data: download.data,
            },
          });
        } catch (err) {
          logger.error(`Failed to download image media_id=${msg.image.id}: ${err}`);
        }
      } else if (msg.type === 'audio' && msg.audio?.id) {
        logger.info(
          `Received audio from=${senderPhone} media_id=${msg.audio.id} mime_type=${msg.audio.mime_type ?? 'unknown'}`,
        );
        try {
          const webhookMimeType = msg.audio.mime_type as string | undefined;
          const download = await this.whatsappService.downloadMedia({
            mediaId: msg.audio.id,
            mimeType: webhookMimeType,
          });
          logger.info(
            `Downloaded audio media_id=${msg.audio.id} size=${download.data.length} mime_type=${download.mimeType}`,
          );
          await this.messageService.handleIncoming({
            waMessageId: msg.id,
            senderPhone,
            body: '',
            media: {
              mimeType: download.mimeType,
              data: download.data,
            },
          });
        } catch (err) {
          logger.error(`Failed to download audio media_id=${msg.audio.id}: ${err}`);
        }
      } else {
        logger.warn(
          `Unhandled message type=${msg.type} from=${senderPhone} wa_message_id=${msg.id}`,
        );
      }
    }
  }
}
