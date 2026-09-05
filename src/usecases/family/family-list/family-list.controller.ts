import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FamilyListUseCase } from './family-list.usecase';
import type { familyListQuerySchema } from './family-list.schema';

interface Dependencies {
  familyListUseCase: FamilyListUseCase;
}

export class FamilyListController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as z.infer<typeof familyListQuerySchema>;

    const result = await this.dependencies.familyListUseCase.execute(query);

    return reply.status(200).send({
      success: true,
      data: { families: result.families.map((family) => family.toJSON()), pagination: result.pagination },
    });
  }
}
