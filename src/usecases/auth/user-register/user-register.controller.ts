import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserRegisterUseCase } from './user-register.usecase';
import type { userRegisterSchema } from './user-register.schema';

interface Dependencies {
  userRegisterUseCase: UserRegisterUseCase;
}

export class UserRegisterController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof userRegisterSchema>;

    const result = await this.dependencies.userRegisterUseCase.execute({
      email: body.email,
      password: body.password,
      jwtSign: (payload) => reply.jwtSign(payload),
    });

    return reply.status(201).send({
      success: true,
      data: { user: result.user.toJSON(), accessToken: result.accessToken },
    });
  }
}
