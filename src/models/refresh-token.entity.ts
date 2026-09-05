import { DomainError } from '@/shared/errors';

export type RefreshTokenProps = {
  id: string | null;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
};

export class RefreshToken {
  private constructor(private props: RefreshTokenProps) {}

  static create(props: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string | null;
  }): RefreshToken {
    return new RefreshToken({
      id: null,
      userId: props.userId,
      tokenHash: props.tokenHash,
      expiresAt: props.expiresAt,
      revokedAt: null,
      userAgent: props.userAgent ?? null,
    });
  }

  static restore(props: RefreshTokenProps): RefreshToken {
    if (!props.id) throw new DomainError('Refresh token inválido (id ausente)', 'REFRESH_TOKEN.INVALID_STATE');
    return new RefreshToken({ ...props });
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get tokenHash() { return this.props.tokenHash; }
  get expiresAt() { return this.props.expiresAt; }
  get revokedAt() { return this.props.revokedAt; }
  get userAgent() { return this.props.userAgent; }

  isValid(now: Date = new Date()): boolean {
    return this.props.revokedAt === null && this.props.expiresAt > now;
  }

  revoke(when: Date = new Date()) {
    this.props.revokedAt = when;
  }
}
