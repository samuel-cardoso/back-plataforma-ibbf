import { RefreshToken, User } from '@/models';
import { DomainError } from '@/shared/errors';
import { DEFAULT_USER_ROLE_NAME } from '@/shared/constants';
import { createRefreshTokenValue } from '@/shared/refresh-token';
import { RefreshTokenRepositoryPort, RoleRepositoryPort, UserRepositoryPort } from '@/repositories';
import type { UserRegisterInput } from './user-register.dto';

interface Dependencies {
  userRepository: UserRepositoryPort;
  roleRepository: RoleRepositoryPort;
  refreshTokenRepository: RefreshTokenRepositoryPort;
}

export class UserRegisterUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: UserRegisterInput) {
    const existing = await this.dependencies.userRepository.findByEmail(input.email);
    if (existing) {
      throw new DomainError('Usuário já registrado com este email', 'USER.EMAIL_ALREADY_EXISTS');
    }

    const defaultRole = await this.dependencies.roleRepository.findByName(DEFAULT_USER_ROLE_NAME);
    if (!defaultRole) {
      // Falha de configuração (seed não rodado), não de regra de negócio —
      // por isso não é um DomainError, cai no handler 500 genérico.
      throw new Error(`Role padrão "${DEFAULT_USER_ROLE_NAME}" não encontrada — rode o seed do banco.`);
    }

    const user = await User.create({
      email: input.email,
      password: input.password,
      roleId: defaultRole.id,
    });

    const created = await this.dependencies.userRepository.create(user);

    const { raw, tokenHash, expiresAt } = createRefreshTokenValue();
    const refreshToken = RefreshToken.create({
      userId: created.id as string,
      tokenHash,
      expiresAt,
      userAgent: input.userAgent,
    });
    await this.dependencies.refreshTokenRepository.create(refreshToken);

    const accessToken = await input.jwtSign({ sub: created.id, email: created.email, roleId: created.roleId });

    return { user: created, accessToken, refreshToken: raw };
  }
}
