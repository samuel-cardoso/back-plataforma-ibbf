import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { VerifyEmailUseCase } from './verify-email.usecase';
import type { verifyEmailSchema } from './verify-email.schema';

interface Dependencies {
  verifyEmailUseCase: VerifyEmailUseCase;
}

export class VerifyEmailController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof verifyEmailSchema>;

    await this.dependencies.verifyEmailUseCase.execute({ email: body.email, code: body.code });

    return reply.status(200).send({ success: true });
  }
}
