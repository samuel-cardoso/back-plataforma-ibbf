import { User } from '@/models';
import { DomainError } from '@/shared/errors';
import { hashPasswordResetCode } from '@/shared/password-reset-code';
import { PasswordResetCodeRepositoryPort, UserRepositoryPort } from '@/repositories';
import type { ResetPasswordInput } from './reset-password.dto';

interface Dependencies {
  userRepository: UserRepositoryPort;
  passwordResetCodeRepository: PasswordResetCodeRepositoryPort;
}

export class ResetPasswordUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const user = await this.dependencies.userRepository.findByEmail(input.email);

    // Mesma mensagem para email inexistente e código inválido/expirado — não dá
    // pra um atacante descobrir se o email existe só pela resposta.
    if (!user) {
      throw new DomainError('Código inválido ou expirado', 'AUTH.INVALID_RESET_CODE');
    }

    const codeHash = hashPasswordResetCode(input.code);
    const resetCode = await this.dependencies.passwordResetCodeRepository.findValidByUserAndCodeHash(
      user.id as string,
      codeHash,
    );

    if (!resetCode || !resetCode.isValid()) {
      throw new DomainError('Código inválido ou expirado', 'AUTH.INVALID_RESET_CODE');
    }

    resetCode.markUsed();
    await this.dependencies.passwordResetCodeRepository.update(resetCode);

    const newPasswordHash = await User.hashPassword(input.newPassword);
    await this.dependencies.userRepository.updatePassword(user.id as string, newPasswordHash);
  }
}
