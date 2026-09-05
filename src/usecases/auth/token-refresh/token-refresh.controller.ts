import type { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { TokenRefreshUseCase } from './token-refresh.usecase';
import type { tokenRefreshSchema } from './token-refresh.schema';

interface Dependencies {
  tokenRefreshUseCase: TokenRefreshUseCase;
}

export class TokenRefreshController {
  constructor(private readonly dependencies: Dependencies) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as z.infer<typeof tokenRefreshSchema>;

    const result = await this.dependencies.tokenRefreshUseCase.execute({
      refreshToken: body.refreshToken,
      userAgent: request.headers['user-agent'],
      jwtSign: (payload) => reply.jwtSign(payload),
    });

    return reply.status(200).send({ success: true, data: result });
  }
}
