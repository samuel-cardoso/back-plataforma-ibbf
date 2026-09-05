import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { LogoutUseCase } from './logout.usecase';
import type { logoutSchema } from './logout.schema';

interface Dependencies {
  logoutUseCase: LogoutUseCase;
}

export class LogoutController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof logoutSchema>;

    await this.dependencies.logoutUseCase.execute({ refreshToken: body.refreshToken });

    return reply.status(200).send({ success: true });
  }
}
