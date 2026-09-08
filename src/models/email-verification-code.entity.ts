import { DomainError } from '@/shared/errors';

export type EmailVerificationCodeProps = {
  id: string | null;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export class EmailVerificationCode {
  private constructor(private props: EmailVerificationCodeProps) {}

  static create(props: { userId: string; codeHash: string; expiresAt: Date; now?: Date }): EmailVerificationCode {
    return new EmailVerificationCode({
      id: null,
      userId: props.userId,
      codeHash: props.codeHash,
      expiresAt: props.expiresAt,
      usedAt: null,
      createdAt: props.now ?? new Date(),
    });
  }

  static restore(props: EmailVerificationCodeProps): EmailVerificationCode {
    if (!props.id) throw new DomainError('Código de verificação inválido (id ausente)', 'EMAIL_VERIFICATION_CODE.INVALID_STATE');
    return new EmailVerificationCode({ ...props });
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get codeHash() { return this.props.codeHash; }
  get expiresAt() { return this.props.expiresAt; }
  get usedAt() { return this.props.usedAt; }
  get createdAt() { return this.props.createdAt; }

  isValid(now: Date = new Date()): boolean {
    return this.props.usedAt === null && this.props.expiresAt > now;
  }

  markUsed(when: Date = new Date()) {
    this.props.usedAt = when;
  }
}
