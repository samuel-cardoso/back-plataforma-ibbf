import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MinistryMemberUpdateRoleUseCase } from './ministry-member-update-role.usecase';
import type { ministryMemberUpdateRoleSchema } from './ministry-member-update-role.schema';

interface Dependencies {
  ministryMemberUpdateRoleUseCase: MinistryMemberUpdateRoleUseCase;
}

export class MinistryMemberUpdateRoleController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { ministryId: string; memberId: string };
    const body = request.body as z.infer<typeof ministryMemberUpdateRoleSchema>;

    const participation = await this.dependencies.ministryMemberUpdateRoleUseCase.execute({
      ministryId: params.ministryId,
      memberId: params.memberId,
      role: body.role,
    });

    return reply.status(200).send({ success: true, data: { participation: participation.toJSON() } });
  }
}
