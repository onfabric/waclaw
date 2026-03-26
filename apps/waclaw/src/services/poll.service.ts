import type { QueuedMessage } from '#db/types.ts';
import type { MessageRepository } from '#repositories/message.repository.ts';
import { Service } from '#services/service.ts';

export type PollResponse = {
  sender_phone: string;
  body: string;
  wa_message_id: string;
  message_id: string;
};

type Resolver = (msg: PollResponse) => void;

export class PollService extends Service {
  private readonly messageRepo: MessageRepository;
  private readonly waiting = new Map<string, Resolver>();

  constructor(messageRepo: MessageRepository) {
    super();
    this.messageRepo = messageRepo;
  }

  park({
    connectorToken,
    timeoutMs,
  }: {
    connectorToken: string;
    timeoutMs: number;
  }): Promise<PollResponse | null> {
    const queued = this.messageRepo.deleteOldest({ connectorToken });
    if (queued) {
      return Promise.resolve(toResponse(queued));
    }

    return new Promise<PollResponse | null>((resolve) => {
      this.waiting.set(connectorToken, resolve);

      setTimeout(() => {
        if (this.waiting.get(connectorToken) === resolve) {
          this.waiting.delete(connectorToken);
          resolve(null);
        }
      }, timeoutMs);
    });
  }

  deliver({ connectorToken, msg }: { connectorToken: string; msg: PollResponse }): boolean {
    const resolver = this.waiting.get(connectorToken);
    if (!resolver) {
      return false;
    }
    this.waiting.delete(connectorToken);
    resolver(msg);
    return true;
  }
}

function toResponse(msg: QueuedMessage): PollResponse {
  return {
    sender_phone: msg.sender_phone,
    body: msg.body,
    wa_message_id: msg.wa_message_id,
    message_id: msg.id,
  };
}
