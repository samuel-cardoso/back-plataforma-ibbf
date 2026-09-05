import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FamilyDetailsUseCase } from './family-details.usecase';

interface Dependencies {
  familyDetailsUseCase: FamilyDetailsUseCase;
}

export class FamilyDetailsController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };

    const family = await this.dependencies.familyDetailsUseCase.execute({ id: params.id });

    return reply.status(200).send({ success: true, data: { family: family.toJSON() } });
  }
}
