import { createHash, randomBytes } from 'node:crypto';
import { REFRESH_TOKEN_TTL_DAYS } from './constants';

/** Nunca armazenamos o valor bruto do refresh token — só o hash (comparável a uma senha). */
export function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function createRefreshTokenValue(now: Date = new Date()) {
  const raw = randomBytes(40).toString('hex');
  return {
    raw,
    tokenHash: hashRefreshToken(raw),
    expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  };
}
