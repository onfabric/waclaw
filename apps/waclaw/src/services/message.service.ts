import { logger } from '#lib/logger.ts';
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
    waMessageId,
    senderPhone,
    body,
    media,
  }: {
    waMessageId: string;
    senderPhone: string;
    body: string;
    media?: { mimeType: string; data: Buffer };
  }): Promise<void> {
    const route = this.routeService.getBySenderPhone({ senderPhone });
    if (!route) {
      logger.warn(`No route for sender_phone=${senderPhone}`);
      return;
    }

    logger.info(
      `Incoming message from=${senderPhone} wa_message_id=${waMessageId} connector_token=${route.connector_token}${media ? ` media=${media.mimeType}` : ''}`,
    );

    const pollResponse = {
      sender_phone: senderPhone,
      body,
      wa_message_id: waMessageId,
      message_id: Bun.randomUUIDv7(),
      ...(media && {
        media: {
          mime_type: media.mimeType,
          base64Data: media.data.toString('base64'),
        },
      }),
    };

    const delivered = this.pollService.deliver({
      connectorToken: route.connector_token,
      msg: pollResponse,
    });

    if (delivered) {
      logger.info(`Delivered to waiting poller connector_token=${route.connector_token}`);
    } else if (media) {
      logger.info(
        `No waiting poller, queuing media message in memory connector_token=${route.connector_token}`,
      );
      this.pollService.enqueue({ connectorToken: route.connector_token, msg: pollResponse });
    } else {
      logger.info(`No waiting poller, queuing message connector_token=${route.connector_token}`);
      this.messageRepo.create({
        connectorToken: route.connector_token,
        senderPhone,
        body,
        waMessageId,
      });
    }
  }
}
