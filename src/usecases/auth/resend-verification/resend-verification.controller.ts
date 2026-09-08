import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ResendVerificationUseCase } from './resend-verification.usecase';
import type { resendVerificationSchema } from './resend-verification.schema';

interface Dependencies {
  resendVerificationUseCase: ResendVerificationUseCase;
}

export class ResendVerificationController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof resendVerificationSchema>;

    await this.dependencies.resendVerificationUseCase.execute({ email: body.email });

    return reply.status(200).send({
      success: true,
      message: 'Se o email estiver cadastrado e ainda não verificado, um novo código foi enviado.',
    });
  }
}
