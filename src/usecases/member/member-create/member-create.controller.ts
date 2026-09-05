import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MemberCreateUseCase } from './member-create.usecase';
import type { memberCreateSchema } from './member-create.schema';

interface Dependencies {
  memberCreateUseCase: MemberCreateUseCase;
}

export class MemberCreateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof memberCreateSchema>;

    const member = await this.dependencies.memberCreateUseCase.execute(body);

    return reply.status(201).send({ success: true, data: { member: member.toJSON() } });
  }
}
