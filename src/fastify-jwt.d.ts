import 'fastify';
import type { onRequestHookHandler } from 'fastify';
import { User } from '@/models';

export interface TokenPayload {
  sub: string;
  email: string;
  roleId: string;
  iat: number;
}

/**
 * Module augmentation: ensina o TypeScript que `request.user`, `request.userEntity`
 * e os decorators abaixo existem no Fastify, mesmo eles sendo adicionados
 * dinamicamente em runtime (server.decorate, em server.ts).
 */
declare module 'fastify' {
  interface FastifyRequest {
    user: TokenPayload;
    /** Usuário completo do banco, populado por `authenticate()`. */
    userEntity?: User;
  }

  export interface FastifyInstance {
    authenticate(): onRequestHookHandler;
    /** Deve vir depois de `authenticate()`. Bloqueia com 403 se o role do usuário tiver level < minLevel. */
    authorize(minLevel: number): onRequestHookHandler;
  }
}
