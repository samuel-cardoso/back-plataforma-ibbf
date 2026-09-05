import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MinistryMemberRemoveUseCase } from './ministry-member-remove.usecase';

interface Dependencies {
  ministryMemberRemoveUseCase: MinistryMemberRemoveUseCase;
}

export class MinistryMemberRemoveController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { ministryId: string; memberId: string };

    await this.dependencies.ministryMemberRemoveUseCase.execute({
      ministryId: params.ministryId,
      memberId: params.memberId,
    });

    return reply.status(200).send({ success: true });
  }
}
