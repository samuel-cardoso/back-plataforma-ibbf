import { PasswordResetCode } from '@/models';
import { createPasswordResetCodeValue } from '@/shared/password-reset-code';
import { PasswordResetCodeRepositoryPort, UserRepositoryPort } from '@/repositories';
import { MailerPort } from '@/services';
import type { ForgotPasswordInput } from './forgot-password.dto';

interface Dependencies {
  userRepository: UserRepositoryPort;
  passwordResetCodeRepository: PasswordResetCodeRepositoryPort;
  mailerService: MailerPort;
}

/**
 * Nunca revela se o email existe: sempre resolve com sucesso, mesmo quando o
 * usuário não existe ou não está ACTIVE (evita usar esta rota para descobrir
 * quais emails estão cadastrados).
 */
export class ForgotPasswordUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: ForgotPasswordInput): Promise<void> {
    const user = await this.dependencies.userRepository.findByEmail(input.email);
    if (!user || user.status !== 'ACTIVE') {
      return;
    }

    const { raw, codeHash, expiresAt } = createPasswordResetCodeValue();
    const resetCode = PasswordResetCode.create({ userId: user.id as string, codeHash, expiresAt });
    await this.dependencies.passwordResetCodeRepository.create(resetCode);

    await this.dependencies.mailerService.sendPasswordResetCode({ to: user.email, code: raw });
  }
}
