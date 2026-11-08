import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FinanceRoleAssignUseCase } from './finance-role-assign.usecase';
import type { financeRoleAssignSchema } from './finance-role-assign.schema';

interface Dependencies {
  financeRoleAssignUseCase: FinanceRoleAssignUseCase;
}

export class FinanceRoleAssignController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { userId: string };
    const body = request.body as z.infer<typeof financeRoleAssignSchema>;

    const role = await this.dependencies.financeRoleAssignUseCase.execute({
      targetUserId: params.userId,
      role: body.role,
      canViewIndividualGiving: body.canViewIndividualGiving,
      userId: request.userEntity?.id as string,
    });

    const { userId, role: name, canViewIndividualGiving } = role.toJSON();
    return reply.status(200).send({ success: true, data: { financeRole: { userId, role: name, canViewIndividualGiving } } });
  }
}
