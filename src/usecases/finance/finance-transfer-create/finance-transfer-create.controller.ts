import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceTransferCreateUseCase } from './finance-transfer-create.usecase';
import type { financeTransferCreateSchema } from './finance-transfer-create.schema';

interface Dependencies {
  financeTransferCreateUseCase: FinanceTransferCreateUseCase;
}

export class FinanceTransferCreateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof financeTransferCreateSchema>;

    const transactions = await this.dependencies.financeTransferCreateUseCase.execute({
      ...body,
      userId: request.userEntity?.id as string,
    });

    return reply.status(201).send({
      success: true,
      data: { transactions: transactions.map((transaction) => transaction.toJSON()) },
    });
  }
}
