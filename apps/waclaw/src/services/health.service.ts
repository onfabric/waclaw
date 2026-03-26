import type { HealthRepository } from '#repositories/health.repository.ts';
import { Service } from '#services/service.ts';

export class HealthService extends Service {
  private readonly healthRepo: HealthRepository;

  constructor(healthRepo: HealthRepository) {
    super();
    this.healthRepo = healthRepo;
  }

  check(): { status: string; uptime: number } {
    this.healthRepo.ping();
    return { status: 'ok', uptime: process.uptime() };
  }
}
