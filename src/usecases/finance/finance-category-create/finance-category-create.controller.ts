import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceCategoryCreateUseCase } from './finance-category-create.usecase';
import type { financeCategoryCreateSchema } from './finance-category-create.schema';

interface Dependencies {
  financeCategoryCreateUseCase: FinanceCategoryCreateUseCase;
}

export class FinanceCategoryCreateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof financeCategoryCreateSchema>;

    const created = await this.dependencies.financeCategoryCreateUseCase.execute({ ...body, userId: request.userEntity?.id as string });

    return reply.status(201).send({ success: true, data: { category: created.toJSON() } });
  }
}
