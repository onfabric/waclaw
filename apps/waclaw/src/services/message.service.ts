import type { MessageRepository } from '#repositories/message.repository.ts';
import type { PollService } from '#services/poll.service.ts';
import type { RouteService } from '#services/route.service.ts';
import { Service } from '#services/service.ts';

export class MessageService extends Service {
  private readonly routeService: RouteService;
  private readonly messageRepo: MessageRepository;
  private readonly pollService: PollService;

  constructor(
    routeService: RouteService,
    messageRepo: MessageRepository,
    pollService: PollService,
  ) {
    super();
    this.routeService = routeService;
    this.messageRepo = messageRepo;
    this.pollService = pollService;
  }

  async handleIncoming({
    phoneNumberId,
    waMessageId,
    senderPhone,
    body,
  }: {
    phoneNumberId: string;
    waMessageId: string;
    senderPhone: string;
    body: string;
  }): Promise<void> {
    const route = this.routeService.getByPhoneNumberId({ phoneNumberId });
    if (!route) {
      return;
    }

    const delivered = this.pollService.deliver({
      connectorToken: route.connector_token,
      msg: {
        sender_phone: senderPhone,
        body,
        wa_message_id: waMessageId,
        message_id: Bun.randomUUIDv7(),
      },
    });

    if (!delivered) {
      this.messageRepo.create({
        connectorToken: route.connector_token,
        senderPhone,
        body,
        waMessageId,
      });
    }
  }
}
