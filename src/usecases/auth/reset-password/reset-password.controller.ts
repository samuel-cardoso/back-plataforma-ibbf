import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ResetPasswordUseCase } from './reset-password.usecase';
import type { resetPasswordSchema } from './reset-password.schema';

interface Dependencies {
  resetPasswordUseCase: ResetPasswordUseCase;
}

export class ResetPasswordController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof resetPasswordSchema>;

    await this.dependencies.resetPasswordUseCase.execute({
      email: body.email,
      code: body.code,
      newPassword: body.newPassword,
    });

    return reply.status(200).send({ success: true });
  }
}
