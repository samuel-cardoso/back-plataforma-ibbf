import type { FastifyReply } from 'fastify';
import type { HealthCheckUseCase } from './health-check.usecase';

interface Dependencies { healthCheckUseCase: HealthCheckUseCase; }

export class HealthCheckController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(reply: FastifyReply) {
    return reply.status(200).send({ success: true, data: this.dependencies.healthCheckUseCase.execute() });
  }
}
