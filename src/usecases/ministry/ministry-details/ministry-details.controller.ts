import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MinistryDetailsUseCase } from './ministry-details.usecase';

interface Dependencies {
  ministryDetailsUseCase: MinistryDetailsUseCase;
}

export class MinistryDetailsController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };

    const ministry = await this.dependencies.ministryDetailsUseCase.execute({ id: params.id });

    return reply.status(200).send({ success: true, data: { ministry: ministry.toJSON() } });
  }
}
