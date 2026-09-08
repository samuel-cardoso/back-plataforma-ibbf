import { createHash, randomInt } from 'node:crypto';
import { PASSWORD_RESET_CODE_TTL_MINUTES } from './constants';

/** Nunca armazenamos o valor bruto do código — só o hash (comparável a uma senha). */
export function hashPasswordResetCode(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function createPasswordResetCodeValue(now: Date = new Date()) {
  const raw = randomInt(0, 1_000_000).toString().padStart(6, '0');
  return {
    raw,
    codeHash: hashPasswordResetCode(raw),
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_CODE_TTL_MINUTES * 60 * 1000),
  };
}
