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
        const messages = change.value.messages ?? [];
        for (const msg of messages) {
          if (msg.type === 'text' && msg.text?.body) {
            await this.messageService.handleIncoming({
              phoneNumberId: phone_number_id,
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
