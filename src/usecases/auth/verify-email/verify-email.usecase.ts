import { DomainError } from '@/shared/errors';
import { hashEmailVerificationCode } from '@/shared/email-verification-code';
import { EmailVerificationCodeRepositoryPort, UserRepositoryPort } from '@/repositories';
import type { VerifyEmailInput } from './verify-email.dto';

interface Dependencies {
  userRepository: UserRepositoryPort;
  emailVerificationCodeRepository: EmailVerificationCodeRepositoryPort;
}

/**
 * Só marca `emailVerifiedAt` — não altera `status` nem emite tokens. A conta já
 * está utilizável desde o registro; isto é apenas um selo de confiança extra.
 */
export class VerifyEmailUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: VerifyEmailInput): Promise<void> {
    const user = await this.dependencies.userRepository.findByEmail(input.email);

    // Mesma mensagem para email inexistente e código inválido/expirado — não dá
    // pra um atacante descobrir se o email existe só pela resposta.
    if (!user) {
      throw new DomainError('Código inválido ou expirado', 'AUTH.INVALID_VERIFICATION_CODE');
    }

    if (user.emailVerifiedAt) {
      throw new DomainError('Email já verificado', 'AUTH.EMAIL_ALREADY_VERIFIED');
    }

    const codeHash = hashEmailVerificationCode(input.code);
    const verificationCode = await this.dependencies.emailVerificationCodeRepository.findValidByUserAndCodeHash(
      user.id as string,
      codeHash,
    );

    if (!verificationCode || !verificationCode.isValid()) {
      throw new DomainError('Código inválido ou expirado', 'AUTH.INVALID_VERIFICATION_CODE');
    }

    verificationCode.markUsed();
    await this.dependencies.emailVerificationCodeRepository.update(verificationCode);

    const verifiedAt = new Date();
    user.markEmailVerified(verifiedAt);
    await this.dependencies.userRepository.updateEmailVerifiedAt(user.id as string, verifiedAt);
  }
}
