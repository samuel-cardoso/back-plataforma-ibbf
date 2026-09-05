import { RefreshToken } from '@/models';
import { DomainError } from '@/shared/errors';
import { createRefreshTokenValue } from '@/shared/refresh-token';
import { RefreshTokenRepositoryPort, UserRepositoryPort } from '@/repositories';
import type { UserLoginInput } from './user-login.dto';

interface Dependencies {
  userRepository: UserRepositoryPort;
  refreshTokenRepository: RefreshTokenRepositoryPort;
}

export class UserLoginUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: UserLoginInput) {
    const user = await this.dependencies.userRepository.findByEmail(input.email);

    // Mesma mensagem em ambos os casos (usuário inexistente, inativo ou senha
    // errada) — não dá pra um atacante descobrir se o email existe só pela resposta.
    if (!user || user.status !== 'ACTIVE') {
      throw new DomainError('Credenciais inválidas', 'USER.INVALID_CREDENTIALS');
    }

    const passwordMatches = await user.comparePassword(input.password);
    if (!passwordMatches) {
      throw new DomainError('Credenciais inválidas', 'USER.INVALID_CREDENTIALS');
    }

    user.recordLogin();
    await this.dependencies.userRepository.updateLastLogin(user.id as string, user.lastLoginAt as Date);

    const { raw, tokenHash, expiresAt } = createRefreshTokenValue();
    const refreshToken = RefreshToken.create({
      userId: user.id as string,
      tokenHash,
      expiresAt,
      userAgent: input.userAgent,
    });
    await this.dependencies.refreshTokenRepository.create(refreshToken);

    const accessToken = await input.jwtSign({ sub: user.id, email: user.email, roleId: user.roleId });

    return { user, accessToken, refreshToken: raw };
  }
}
