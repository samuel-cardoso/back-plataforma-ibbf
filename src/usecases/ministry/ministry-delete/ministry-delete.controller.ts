import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MinistryDeleteUseCase } from './ministry-delete.usecase';

interface Dependencies {
  ministryDeleteUseCase: MinistryDeleteUseCase;
}

export class MinistryDeleteController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };

    await this.dependencies.ministryDeleteUseCase.execute({ id: params.id });

    return reply.status(200).send({ success: true });
  }
}
