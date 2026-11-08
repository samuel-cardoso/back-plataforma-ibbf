import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinancePeriodListUseCase } from './finance-period-list.usecase';
import type { financePeriodListQuerySchema } from './finance-period-list.schema';

interface Dependencies {
  financePeriodListUseCase: FinancePeriodListUseCase;
}

export class FinancePeriodListController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as z.infer<typeof financePeriodListQuerySchema>;

    const periods = await this.dependencies.financePeriodListUseCase.execute(query);

    return reply.status(200).send({ success: true, data: { periods: periods.map((period) => period.toJSON()) } });
  }
}
