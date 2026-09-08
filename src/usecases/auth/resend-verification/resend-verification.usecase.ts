import { EmailVerificationCode } from '@/models';
import { createEmailVerificationCodeValue } from '@/shared/email-verification-code';
import { EmailVerificationCodeRepositoryPort, UserRepositoryPort } from '@/repositories';
import { MailerPort } from '@/services';
import type { ResendVerificationInput } from './resend-verification.dto';

interface Dependencies {
  userRepository: UserRepositoryPort;
  emailVerificationCodeRepository: EmailVerificationCodeRepositoryPort;
  mailerService: MailerPort;
}

/**
 * Nunca revela se o email existe ou já foi verificado: sempre resolve com
 * sucesso, mesmo quando o usuário não existe ou já confirmou o email antes.
 */
export class ResendVerificationUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: ResendVerificationInput): Promise<void> {
    const user = await this.dependencies.userRepository.findByEmail(input.email);
    if (!user || user.emailVerifiedAt) {
      return;
    }

    const { raw, codeHash, expiresAt } = createEmailVerificationCodeValue();
    const verificationCode = EmailVerificationCode.create({ userId: user.id as string, codeHash, expiresAt });
    await this.dependencies.emailVerificationCodeRepository.create(verificationCode);

    await this.dependencies.mailerService.sendEmailVerificationCode({ to: user.email, code: raw });
  }
}
