import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceRoleRevokeUseCase } from './finance-role-revoke.usecase';

interface Dependencies {
  financeRoleRevokeUseCase: FinanceRoleRevokeUseCase;
}

export class FinanceRoleRevokeController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { userId: string };

    await this.dependencies.financeRoleRevokeUseCase.execute({
      targetUserId: params.userId,
      userId: request.userEntity?.id as string,
    });

    return reply.status(200).send({ success: true });
  }
}
