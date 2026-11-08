import 'fastify';
import type { onRequestHookHandler } from 'fastify';
import { User, UserFinanceRole, FinanceRoleName } from '@/models';

export interface TokenPayload {
  sub: string;
  email: string;
  roleId: string;
  /** ISO string de quando o email foi confirmado (POST /auth/verify-email), ou null. Não é checado pelo backend — só alimenta decisão de UI no front. */
  emailVerifiedAt: string | null;
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
    /** Papel financeiro do usuário, populado por `authorizeFinance()`. */
    financeRole?: UserFinanceRole;
  }

  export interface FastifyInstance {
    authenticate(): onRequestHookHandler;
    /** Deve vir depois de `authenticate()`. Bloqueia com 403 se o role do usuário tiver level < minLevel. */
    authorize(minLevel: number): onRequestHookHandler;
    /**
     * Deve vir depois de `authenticate()`. Bloqueia com 403 (`FINANCE.FORBIDDEN`) se o usuário não tiver
     * um dos papéis financeiros informados. Independe do `Role.level` (segregação de funções).
     */
    authorizeFinance(allowedRoles: FinanceRoleName[]): onRequestHookHandler;
  }
}
