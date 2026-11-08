import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FundUpdateUseCase } from './fund-update.usecase';
import type { fundUpdateSchema } from './fund-update.schema';

interface Dependencies {
  fundUpdateUseCase: FundUpdateUseCase;
}

export class FundUpdateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };
    const body = request.body as z.infer<typeof fundUpdateSchema>;

    const updated = await this.dependencies.fundUpdateUseCase.execute({
      id: params.id,
      ...body,
      userId: request.userEntity?.id as string,
    });

    return reply.status(200).send({ success: true, data: { fund: updated.toJSON() } });
  }
}
