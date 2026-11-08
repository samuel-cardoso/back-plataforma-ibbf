import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceSummaryUseCase } from './finance-summary.usecase';
import type { financeSummaryQuerySchema } from './finance-summary.schema';

interface Dependencies {
  financeSummaryUseCase: FinanceSummaryUseCase;
}

export class FinanceSummaryController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as z.infer<typeof financeSummaryQuerySchema>;

    const summary = await this.dependencies.financeSummaryUseCase.execute(query);

    return reply.status(200).send({ success: true, data: summary });
  }
}
