import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceTransactionCreateUseCase } from './finance-transaction-create.usecase';
import type { financeTransactionCreateSchema } from './finance-transaction-create.schema';

interface Dependencies {
  financeTransactionCreateUseCase: FinanceTransactionCreateUseCase;
}

export class FinanceTransactionCreateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof financeTransactionCreateSchema>;
    const canViewIndividualGiving = request.financeRole?.canViewIndividualGiving ?? false;

    const transaction = await this.dependencies.financeTransactionCreateUseCase.execute({
      ...body,
      userId: request.userEntity?.id as string,
      canViewIndividualGiving,
    });

    return reply.status(201).send({
      success: true,
      data: { transaction: transaction.toJSON({ includeMember: canViewIndividualGiving }) },
    });
  }
}
