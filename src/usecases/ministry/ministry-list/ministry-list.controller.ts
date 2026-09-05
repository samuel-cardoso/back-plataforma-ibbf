import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MinistryListUseCase } from './ministry-list.usecase';
import type { ministryListQuerySchema } from './ministry-list.schema';

interface Dependencies {
  ministryListUseCase: MinistryListUseCase;
}

export class MinistryListController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as z.infer<typeof ministryListQuerySchema>;

    const result = await this.dependencies.ministryListUseCase.execute(query);

    return reply.status(200).send({
      success: true,
      data: { ministries: result.ministries.map((ministry) => ministry.toJSON()), pagination: result.pagination },
    });
  }
}
