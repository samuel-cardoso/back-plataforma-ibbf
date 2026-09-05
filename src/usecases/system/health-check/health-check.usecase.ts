import type { HealthCheckOutput } from './health-check.dto';

export class HealthCheckUseCase {
  execute(): HealthCheckOutput {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
