import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CashAccountCreateUseCase } from './cash-account-create.usecase';
import type { cashAccountCreateSchema } from './cash-account-create.schema';

interface Dependencies {
  cashAccountCreateUseCase: CashAccountCreateUseCase;
}

export class CashAccountCreateController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof cashAccountCreateSchema>;

    const created = await this.dependencies.cashAccountCreateUseCase.execute({ ...body, userId: request.userEntity?.id as string });

    return reply.status(201).send({ success: true, data: { account: created.toJSON() } });
  }
}
