import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinancePeriodReopenUseCase } from './finance-period-reopen.usecase';

interface Dependencies {
  financePeriodReopenUseCase: FinancePeriodReopenUseCase;
}

export class FinancePeriodReopenController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { year: number; month: number };
    const body = request.body as { reason: string };

    const period = await this.dependencies.financePeriodReopenUseCase.execute({
      year: params.year,
      month: params.month,
      reason: body.reason,
      userId: request.userEntity?.id as string,
    });

    return reply.status(200).send({ success: true, data: { period: period.toJSON() } });
  }
}
