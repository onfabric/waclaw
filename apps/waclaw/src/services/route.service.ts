import type { Route } from '#db/types.ts';
import { ConflictError, NotFoundError } from '#lib/errors.ts';
import type { RouteRepository } from '#repositories/route.repository.ts';
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
    const existing = this.routeRepo.getBySenderPhone({ senderPhone });
    if (existing) {
      throw new ConflictError(`Route already exists for phone: ${senderPhone}`);
    }

    const id = Bun.randomUUIDv7();
    const connectorToken = crypto.randomUUID();
    return this.routeRepo.create({ id, connectorToken, senderPhone });
  }

  delete({ connectorToken }: { connectorToken: string }): void {
    this.routeRepo.delete({ connectorToken });
  }

  list(): Route[] {
    return this.routeRepo.list();
  }
}
