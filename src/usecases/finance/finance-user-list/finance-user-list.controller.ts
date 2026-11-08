import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceUserListUseCase } from './finance-user-list.usecase';

interface Dependencies {
  financeUserListUseCase: FinanceUserListUseCase;
}

export class FinanceUserListController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(_request: FastifyRequest, reply: FastifyReply) {
    const users = await this.dependencies.financeUserListUseCase.execute();
    return reply.status(200).send({ success: true, data: { users } });
  }
}
