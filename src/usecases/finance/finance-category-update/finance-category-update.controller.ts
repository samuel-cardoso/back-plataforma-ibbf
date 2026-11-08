import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceCategoryUpdateUseCase } from './finance-category-update.usecase';
import type { financeCategoryUpdateSchema } from './finance-category-update.schema';

interface Dependencies {
  financeCategoryUpdateUseCase: FinanceCategoryUpdateUseCase;
}

export class FinanceCategoryUpdateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };
    const body = request.body as z.infer<typeof financeCategoryUpdateSchema>;

    const updated = await this.dependencies.financeCategoryUpdateUseCase.execute({
      id: params.id,
      ...body,
      userId: request.userEntity?.id as string,
    });

    return reply.status(200).send({ success: true, data: { category: updated.toJSON() } });
  }
}
