import { EmailVerificationCode } from '@/models';

export interface EmailVerificationCodeRepositoryPort {
  create(code: EmailVerificationCode): Promise<EmailVerificationCode>;
  /** Só retorna um código não usado e ainda dentro da validade, do usuário informado. */
  findValidByUserAndCodeHash(userId: string, codeHash: string): Promise<EmailVerificationCode | null>;
  update(code: EmailVerificationCode): Promise<EmailVerificationCode>;
}
