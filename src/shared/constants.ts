import { ROLE_LEVELS } from '@samuel-cardoso/ibbf-authz';

/** Role atribuída automaticamente a quem se registra pelo endpoint público. */
export const DEFAULT_USER_ROLE_NAME = 'Membro';

/**
 * Level mínimo para atribuir papéis financeiros (Pastor Titular). Só isso vem da hierarquia;
 * ver ou lançar no financeiro depende do papel financeiro do usuário, não do level.
 */
export const FINANCE_ROLE_MANAGER_MIN_LEVEL = ROLE_LEVELS.PASTOR_TITULAR;

/** Papéis que podem ler o livro-caixa e os saldos. */
export const FINANCE_READ_ROLES = ['TREASURER', 'FISCAL_COUNCIL', 'PASTOR_VIEWER'] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/** Validade de um refresh token emitido em /auth/login, /auth/register ou /auth/refresh. */
export const REFRESH_TOKEN_TTL_DAYS = 30;

/** Validade do código de 6 dígitos emitido em /auth/forgot-password. */
export const PASSWORD_RESET_CODE_TTL_MINUTES = 15;

/** Validade do código de 6 dígitos emitido em /auth/register e /auth/resend-verification. */
export const EMAIL_VERIFICATION_CODE_TTL_MINUTES = 30;
