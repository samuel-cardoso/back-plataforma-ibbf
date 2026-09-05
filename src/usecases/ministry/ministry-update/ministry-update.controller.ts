import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MinistryUpdateUseCase } from './ministry-update.usecase';
import type { ministryUpdateSchema } from './ministry-update.schema';

interface Dependencies {
  ministryUpdateUseCase: MinistryUpdateUseCase;
}

export class MinistryUpdateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };
    const body = request.body as z.infer<typeof ministryUpdateSchema>;

    const ministry = await this.dependencies.ministryUpdateUseCase.execute({ id: params.id, ...body });

    return reply.status(200).send({ success: true, data: { ministry: ministry.toJSON() } });
  }
}
