import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MemberDeleteUseCase } from './member-delete.usecase';

interface Dependencies {
  memberDeleteUseCase: MemberDeleteUseCase;
}

export class MemberDeleteController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };

    await this.dependencies.memberDeleteUseCase.execute({ id: params.id });

    return reply.status(200).send({ success: true });
  }
}
