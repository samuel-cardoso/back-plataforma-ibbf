import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ForgotPasswordUseCase } from './forgot-password.usecase';
import type { forgotPasswordSchema } from './forgot-password.schema';

interface Dependencies {
  forgotPasswordUseCase: ForgotPasswordUseCase;
}

export class ForgotPasswordController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof forgotPasswordSchema>;

    await this.dependencies.forgotPasswordUseCase.execute({ email: body.email });

    return reply.status(200).send({
      success: true,
      message: 'Se o email estiver cadastrado, um código de redefinição foi enviado.',
    });
  }
}
