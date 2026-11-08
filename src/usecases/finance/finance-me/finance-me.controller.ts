import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceMeUseCase } from './finance-me.usecase';

interface Dependencies {
  financeMeUseCase: FinanceMeUseCase;
}

export class FinanceMeController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.dependencies.financeMeUseCase.execute({
      userId: request.userEntity?.id as string,
      roleId: request.userEntity?.roleId as string,
    });

    return reply.status(200).send({ success: true, data: result });
  }
}
