import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinancePeriodCloseUseCase } from './finance-period-close.usecase';

interface Dependencies {
  financePeriodCloseUseCase: FinancePeriodCloseUseCase;
}

export class FinancePeriodCloseController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { year: number; month: number };

    const period = await this.dependencies.financePeriodCloseUseCase.execute({
      year: params.year,
      month: params.month,
      userId: request.userEntity?.id as string,
    });

    return reply.status(200).send({ success: true, data: { period: period.toJSON() } });
  }
}
