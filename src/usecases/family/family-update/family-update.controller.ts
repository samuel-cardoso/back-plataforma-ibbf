import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FamilyUpdateUseCase } from './family-update.usecase';
import type { familyUpdateSchema } from './family-update.schema';

interface Dependencies {
  familyUpdateUseCase: FamilyUpdateUseCase;
}

export class FamilyUpdateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };
    const body = request.body as z.infer<typeof familyUpdateSchema>;

    const family = await this.dependencies.familyUpdateUseCase.execute({ id: params.id, ...body });

    return reply.status(200).send({ success: true, data: { family: family.toJSON() } });
  }
}
