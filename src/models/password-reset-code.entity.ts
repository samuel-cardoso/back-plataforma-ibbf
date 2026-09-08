import { DomainError } from '@/shared/errors';

export type PasswordResetCodeProps = {
  id: string | null;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export class PasswordResetCode {
  private constructor(private props: PasswordResetCodeProps) {}

  static create(props: { userId: string; codeHash: string; expiresAt: Date; now?: Date }): PasswordResetCode {
    return new PasswordResetCode({
      id: null,
      userId: props.userId,
      codeHash: props.codeHash,
      expiresAt: props.expiresAt,
      usedAt: null,
      createdAt: props.now ?? new Date(),
    });
  }

  static restore(props: PasswordResetCodeProps): PasswordResetCode {
    if (!props.id) throw new DomainError('Código de reset inválido (id ausente)', 'PASSWORD_RESET_CODE.INVALID_STATE');
    return new PasswordResetCode({ ...props });
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
