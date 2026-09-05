import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MemberUpdateUseCase } from './member-update.usecase';
import type { memberUpdateSchema } from './member-update.schema';

interface Dependencies {
  memberUpdateUseCase: MemberUpdateUseCase;
}

export class MemberUpdateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };
    const body = request.body as z.infer<typeof memberUpdateSchema>;

    const member = await this.dependencies.memberUpdateUseCase.execute({ id: params.id, ...body });

    return reply.status(200).send({ success: true, data: { member: member.toJSON() } });
  }
}
