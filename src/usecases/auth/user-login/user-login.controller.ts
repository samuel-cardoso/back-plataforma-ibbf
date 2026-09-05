import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserLoginUseCase } from './user-login.usecase';
import type { userLoginSchema } from './user-login.schema';

interface Dependencies {
  userLoginUseCase: UserLoginUseCase;
}

export class UserLoginController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof userLoginSchema>;

    const result = await this.dependencies.userLoginUseCase.execute({
      email: body.email,
      password: body.password,
      jwtSign: (payload) => reply.jwtSign(payload),
    });

    return reply.status(200).send({
      success: true,
      data: { user: result.user.toJSON(), accessToken: result.accessToken },
    });
  }
}
