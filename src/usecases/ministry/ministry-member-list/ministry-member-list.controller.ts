import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MinistryMemberListUseCase } from './ministry-member-list.usecase';
import type { ministryMemberListQuerySchema } from './ministry-member-list.schema';

interface Dependencies {
  ministryMemberListUseCase: MinistryMemberListUseCase;
}

export class MinistryMemberListController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { ministryId: string };
    const query = request.query as z.infer<typeof ministryMemberListQuerySchema>;

    const result = await this.dependencies.ministryMemberListUseCase.execute({
      ministryId: params.ministryId,
      page: query.page,
      limit: query.limit,
    });

    return reply.status(200).send({
      success: true,
      data: {
        participations: result.participations.map((participation) => participation.toJSON()),
        pagination: result.pagination,
      },
    });
  }
}
