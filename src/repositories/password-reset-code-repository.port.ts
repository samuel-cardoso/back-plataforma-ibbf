import { PasswordResetCode } from '@/models';

export interface PasswordResetCodeRepositoryPort {
  create(code: PasswordResetCode): Promise<PasswordResetCode>;
  /** Só retorna um código não usado e ainda dentro da validade, do usuário informado. */
  findValidByUserAndCodeHash(userId: string, codeHash: string): Promise<PasswordResetCode | null>;
  update(code: PasswordResetCode): Promise<PasswordResetCode>;
}
