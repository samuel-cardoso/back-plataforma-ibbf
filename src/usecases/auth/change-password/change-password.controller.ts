import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ChangePasswordUseCase } from './change-password.usecase';
import type { changePasswordSchema } from './change-password.schema';

interface Dependencies {
  changePasswordUseCase: ChangePasswordUseCase;
}

export class ChangePasswordController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof changePasswordSchema>;

    await this.dependencies.changePasswordUseCase.execute({
      userId: request.userEntity?.id as string,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    return reply.status(200).send({ success: true });
  }
}
