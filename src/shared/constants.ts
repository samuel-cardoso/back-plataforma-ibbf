/** Role atribuída automaticamente a quem se registra pelo endpoint público. */
export const DEFAULT_USER_ROLE_NAME = 'Membro';

/** Level mínimo de Role (ver seed de roles) para operações administrativas (ex: gerenciar membros). */
export const STAFF_MIN_ROLE_LEVEL = 40;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
