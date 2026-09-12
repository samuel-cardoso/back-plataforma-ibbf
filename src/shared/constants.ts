/** Role atribuída automaticamente a quem se registra pelo endpoint público. */
export const DEFAULT_USER_ROLE_NAME = 'Membro';

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
