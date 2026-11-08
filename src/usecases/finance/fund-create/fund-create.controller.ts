import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FundCreateUseCase } from './fund-create.usecase';
import type { fundCreateSchema } from './fund-create.schema';

interface Dependencies {
  fundCreateUseCase: FundCreateUseCase;
}

export class FundCreateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof fundCreateSchema>;

    const created = await this.dependencies.fundCreateUseCase.execute({ ...body, userId: request.userEntity?.id as string });

    return reply.status(201).send({ success: true, data: { fund: created.toJSON() } });
  }
}
