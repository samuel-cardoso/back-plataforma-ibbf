import bcrypt from 'bcrypt';
import { DomainError } from '@/shared/errors';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export type UserProps = {
  id: string | null;
  email: string;
  passwordHash: string;
  roleId: string;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
};

/**
 * Entidade rica: construtor privado + factories `create()`/`restore()`.
 * `create()` valida e aplica regras de negócio (usado ao registrar um usuário novo).
 * `restore()` reidrata uma instância a partir de uma linha já validada do banco.
 */
export class User {
  private constructor(private props: UserProps) {}

  static async create(props: { email: string; password: string; roleId: string; now?: Date }): Promise<User> {
    const email = props.email?.trim().toLowerCase();
    if (!User.isValidEmail(email)) {
      throw new DomainError('Email inválido', 'USER.INVALID_EMAIL');
    }

    if (!props.password || props.password.length < 6) {
      throw new DomainError('Senha deve ter ao menos 6 caracteres', 'USER.INVALID_PASSWORD');
    }

    const passwordHash = await bcrypt.hash(props.password, 10);

    return new User({
      id: null,
      email,
      passwordHash,
      roleId: props.roleId,
      status: 'ACTIVE',
      lastLoginAt: null,
      createdAt: props.now ?? new Date(),
    });
  }

  static restore(props: UserProps): User {
    if (!props.id) throw new DomainError('Usuário inválido (id ausente)', 'USER.INVALID_STATE');
    return new User({ ...props });
  }

  get id() { return this.props.id; }
  get email() { return this.props.email; }
  get passwordHash() { return this.props.passwordHash; }
  get roleId() { return this.props.roleId; }
  get status() { return this.props.status; }
  get lastLoginAt() { return this.props.lastLoginAt; }
  get createdAt() { return this.props.createdAt; }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, this.props.passwordHash);
  }

  recordLogin(when: Date = new Date()) {
    this.props.lastLoginAt = when;
  }

  /** Nunca inclui passwordHash — é isso que o controller deve devolver ao cliente. */
  toJSON() {
    return {
      id: this.props.id,
      email: this.props.email,
      roleId: this.props.roleId,
      status: this.props.status,
      lastLoginAt: this.props.lastLoginAt ? this.props.lastLoginAt.toISOString() : null,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  private static isValidEmail(email?: string): boolean {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
