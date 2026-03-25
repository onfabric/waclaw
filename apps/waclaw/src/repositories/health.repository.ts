import { Repository } from '#/repositories/repository.ts';

export class HealthRepository extends Repository {
  ping(): void {
    this.db.query('SELECT 1').run();
  }
}
