import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FamilyDeleteUseCase } from './family-delete.usecase';

interface Dependencies {
  familyDeleteUseCase: FamilyDeleteUseCase;
}

export class FamilyDeleteController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };

    await this.dependencies.familyDeleteUseCase.execute({ id: params.id });

    return reply.status(200).send({ success: true });
  }
}
