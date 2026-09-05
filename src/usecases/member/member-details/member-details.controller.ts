import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MemberDetailsUseCase } from './member-details.usecase';

interface Dependencies {
  memberDetailsUseCase: MemberDetailsUseCase;
}

export class MemberDetailsController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };

    const member = await this.dependencies.memberDetailsUseCase.execute({ id: params.id });

    return reply.status(200).send({ success: true, data: { member: member.toJSON() } });
  }
}
