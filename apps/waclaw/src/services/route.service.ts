import type { Route } from '#db/types.ts';
import { NotFoundError } from '#lib/errors.ts';
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

  getByPhoneNumberId({ phoneNumberId }: { phoneNumberId: string }): Route | null {
    return this.routeRepo.getByPhoneNumberId({ phoneNumberId });
  }

  create({ phoneNumberId }: { phoneNumberId: string }): Route {
    const id = Bun.randomUUIDv7();
    const connectorToken = crypto.randomUUID();
    this.routeRepo.create({ id, connectorToken, phoneNumberId });
    return {
      id,
      connector_token: connectorToken,
      phone_number_id: phoneNumberId,
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  delete({ connectorToken }: { connectorToken: string }): void {
    this.routeRepo.delete({ connectorToken });
  }

  list(): Route[] {
    return this.routeRepo.list();
  }
}
