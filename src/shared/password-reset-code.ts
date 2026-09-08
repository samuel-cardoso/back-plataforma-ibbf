import { createOtpCodeValue, hashOtpCode } from './otp-code';
import { PASSWORD_RESET_CODE_TTL_MINUTES } from './constants';

export const hashPasswordResetCode = hashOtpCode;

export function createPasswordResetCodeValue(now: Date = new Date()) {
  return createOtpCodeValue(PASSWORD_RESET_CODE_TTL_MINUTES, now);
}
