import { env } from '#lib/env.ts';
import { logger } from '#lib/logger.ts';
import type { MetaWebhookPayload } from '#routes/webhook/model.ts';
import type { MessageService } from '#services/message.service.ts';
import { Service } from '#services/service.ts';

export class WebhookService extends Service {
  private readonly messageService: MessageService;

  constructor(messageService: MessageService) {
    super();
    this.messageService = messageService;
  }

  async processIncomingPayload(payload: MetaWebhookPayload): Promise<void> {
    if (payload.object !== 'whatsapp_business_account') {
      return;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const { phone_number_id } = change.value.metadata;

        if (phone_number_id !== env.metaPhoneNumberId) {
          logger.warn(`Ignoring webhook for unknown phone_number_id=${phone_number_id}`);
          continue;
        }

        const messages = change.value.messages ?? [];
        for (const msg of messages) {
          if (msg.type === 'text' && msg.text?.body) {
            await this.messageService.handleIncoming({
              waMessageId: msg.id,
              senderPhone: msg.from,
              body: msg.text.body,
            });
          }
        }
      }
    }
  }
}
