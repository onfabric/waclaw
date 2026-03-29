import type { Route } from '#db/types.ts';
import { ConflictError, NotFoundError } from '#lib/errors.ts';
import type { RouteRepository } from '#repositories/route.repository.ts';
import { DuplicateSenderPhoneError } from '#repositories/route.repository.ts';
import { Service } from '#services/service.ts';

export class RouteService extends Service {
  private readonly routeRepo: RouteRepository;

  constructor(routeRepo: RouteRepository) {
    super();
    this.routeRepo = routeRepo;
  }

  getByConnectorToken({ connectorToken }: { connectorToken: string }): Route {
    const route = this.routeRepo.getByConnectorToken({ connectorToken });
    if (!route) {
      throw new NotFoundError(`Route not found: ${connectorToken}`);
    }
    return route;
  }

  getBySenderPhone({ senderPhone }: { senderPhone: string }): Route | null {
    return this.routeRepo.getBySenderPhone({ senderPhone });
  }

  create({ senderPhone }: { senderPhone: string }): Route {
    try {
      return this.routeRepo.create({
        id: Bun.randomUUIDv7(),
        connectorToken: crypto.randomUUID(),
        senderPhone,
      });
    } catch (error) {
      if (error instanceof DuplicateSenderPhoneError) {
        throw new ConflictError(`Route already exists for phone: ${senderPhone}`);
      }
      throw error;
    }
  }

  delete({ connectorToken }: { connectorToken: string }): void {
    const deletedRouteId = this.routeRepo.delete({ connectorToken });
    if (!deletedRouteId) {
      throw new NotFoundError(`Route not found: ${connectorToken}`);
    }
  }

  list(): Route[] {
    return this.routeRepo.list();
  }

  recordPollActivity({ connectorToken }: { connectorToken: string }): Route {
    const route = this.getByConnectorToken({ connectorToken });
    this.routeRepo.setLastPolledAtToNow({ connectorToken });
    return route;
  }
}
