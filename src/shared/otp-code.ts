import { createHash, randomInt } from 'node:crypto';

/** Nunca armazenamos o valor bruto do código — só o hash (comparável a uma senha). */
export function hashOtpCode(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function createOtpCodeValue(ttlMinutes: number, now: Date = new Date()) {
  const raw = randomInt(0, 1_000_000).toString().padStart(6, '0');
  return {
    raw,
    codeHash: hashOtpCode(raw),
    expiresAt: new Date(now.getTime() + ttlMinutes * 60 * 1000),
  };
}
