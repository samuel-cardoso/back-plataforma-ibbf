import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MinistryCreateUseCase } from './ministry-create.usecase';
import type { ministryCreateSchema } from './ministry-create.schema';

interface Dependencies {
  ministryCreateUseCase: MinistryCreateUseCase;
}

export class MinistryCreateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof ministryCreateSchema>;

    const ministry = await this.dependencies.ministryCreateUseCase.execute(body);

    return reply.status(201).send({ success: true, data: { ministry: ministry.toJSON() } });
  }
}
