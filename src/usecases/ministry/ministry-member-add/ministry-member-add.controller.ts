import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MinistryMemberAddUseCase } from './ministry-member-add.usecase';
import type { ministryMemberAddSchema } from './ministry-member-add.schema';

interface Dependencies {
  ministryMemberAddUseCase: MinistryMemberAddUseCase;
}

export class MinistryMemberAddController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { ministryId: string };
    const body = request.body as z.infer<typeof ministryMemberAddSchema>;

    const participation = await this.dependencies.ministryMemberAddUseCase.execute({
      ministryId: params.ministryId,
      memberId: body.memberId,
      role: body.role,
      joinedAt: body.joinedAt,
    });

    return reply.status(201).send({ success: true, data: { participation: participation.toJSON() } });
  }
}
