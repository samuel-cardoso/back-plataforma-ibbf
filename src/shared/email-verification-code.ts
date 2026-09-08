import { createOtpCodeValue, hashOtpCode } from './otp-code';
import { EMAIL_VERIFICATION_CODE_TTL_MINUTES } from './constants';

export const hashEmailVerificationCode = hashOtpCode;

export function createEmailVerificationCodeValue(now: Date = new Date()) {
  return createOtpCodeValue(EMAIL_VERIFICATION_CODE_TTL_MINUTES, now);
}
