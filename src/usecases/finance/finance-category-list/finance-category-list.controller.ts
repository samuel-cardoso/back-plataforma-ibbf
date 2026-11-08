import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceCategoryListUseCase } from './finance-category-list.usecase';
import type { financeCategoryListQuerySchema } from './finance-category-list.schema';

interface Dependencies {
  financeCategoryListUseCase: FinanceCategoryListUseCase;
}

export class FinanceCategoryListController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as z.infer<typeof financeCategoryListQuerySchema>;

    const items = await this.dependencies.financeCategoryListUseCase.execute(query);

    return reply.status(200).send({ success: true, data: { categories: items.map((item) => item.toJSON()) } });
  }
}
