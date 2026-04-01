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
        await this.messageService.handleIncoming({
          waMessageId: msg.id,
          senderPhone,
          body: msg.text.body,
        });
      } else if (msg.type === 'image' && msg.image?.id) {
        try {
          const webhookMimeType = msg.image.mime_type as string | undefined;
          const download = await this.whatsappService.downloadMedia({
            mediaId: msg.image.id,
            mimeType: webhookMimeType,
          });
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
      }
    }
  }
}
