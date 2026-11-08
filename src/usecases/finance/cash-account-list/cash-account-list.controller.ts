import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CashAccountListUseCase } from './cash-account-list.usecase';
import type { cashAccountListQuerySchema } from './cash-account-list.schema';

interface Dependencies {
  cashAccountListUseCase: CashAccountListUseCase;
}

export class CashAccountListController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as z.infer<typeof cashAccountListQuerySchema>;

    const items = await this.dependencies.cashAccountListUseCase.execute(query);

    return reply.status(200).send({ success: true, data: { accounts: items.map((item) => item.toJSON()) } });
  }
}
