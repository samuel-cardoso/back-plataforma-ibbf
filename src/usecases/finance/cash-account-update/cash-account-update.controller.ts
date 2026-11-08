import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CashAccountUpdateUseCase } from './cash-account-update.usecase';
import type { cashAccountUpdateSchema } from './cash-account-update.schema';

interface Dependencies {
  cashAccountUpdateUseCase: CashAccountUpdateUseCase;
}

export class CashAccountUpdateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = request.params as { id: string };
    const body = request.body as z.infer<typeof cashAccountUpdateSchema>;

    const updated = await this.dependencies.cashAccountUpdateUseCase.execute({
      id: params.id,
      ...body,
      userId: request.userEntity?.id as string,
    });

    return reply.status(200).send({ success: true, data: { account: updated.toJSON() } });
  }
}
