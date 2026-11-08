import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceTransactionReverseUseCase } from './finance-transaction-reverse.usecase';
import type { financeTransactionReverseSchema } from './finance-transaction-reverse.schema';

interface Dependencies {
  financeTransactionReverseUseCase: FinanceTransactionReverseUseCase;
}

export class FinanceTransactionReverseController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };
    const body = request.body as z.infer<typeof financeTransactionReverseSchema>;
    const includeMember = request.financeRole?.canViewIndividualGiving ?? false;

    const transactions = await this.dependencies.financeTransactionReverseUseCase.execute({
      id: params.id,
      ...body,
      userId: request.userEntity?.id as string,
    });

    return reply.status(201).send({
      success: true,
      data: { transactions: transactions.map((transaction) => transaction.toJSON({ includeMember })) },
    });
  }
}
