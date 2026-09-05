import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FamilyCreateUseCase } from './family-create.usecase';
import type { familyCreateSchema } from './family-create.schema';

interface Dependencies {
  familyCreateUseCase: FamilyCreateUseCase;
}

export class FamilyCreateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof familyCreateSchema>;

    const family = await this.dependencies.familyCreateUseCase.execute(body);

    return reply.status(201).send({ success: true, data: { family: family.toJSON() } });
  }
}
