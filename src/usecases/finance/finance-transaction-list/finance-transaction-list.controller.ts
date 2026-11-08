import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceTransactionListUseCase } from './finance-transaction-list.usecase';
import type { financeTransactionListQuerySchema } from './finance-transaction-list.schema';

interface Dependencies {
  financeTransactionListUseCase: FinanceTransactionListUseCase;
}

export class FinanceTransactionListController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as z.infer<typeof financeTransactionListQuerySchema>;
    const canViewIndividualGiving = request.financeRole?.canViewIndividualGiving ?? false;

    const result = await this.dependencies.financeTransactionListUseCase.execute({
      ...query,
      userId: request.userEntity?.id as string,
      canViewIndividualGiving,
    });

    return reply.status(200).send({
      success: true,
      data: {
        transactions: result.transactions.map((transaction) =>
          transaction.toJSON({ includeMember: canViewIndividualGiving })
        ),
        pagination: result.pagination,
      },
    });
  }
}
