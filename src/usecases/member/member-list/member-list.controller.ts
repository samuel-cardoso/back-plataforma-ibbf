import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MemberListUseCase } from './member-list.usecase';
import type { memberListQuerySchema } from './member-list.schema';

interface Dependencies {
  memberListUseCase: MemberListUseCase;
}

export class MemberListController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as z.infer<typeof memberListQuerySchema>;

    const result = await this.dependencies.memberListUseCase.execute(query);

    return reply.status(200).send({
      success: true,
      data: {
        members: result.members.map((member) => member.toJSON()),
        pagination: result.pagination,
      },
    });
  }
}
