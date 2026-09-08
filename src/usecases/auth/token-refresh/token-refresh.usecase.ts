import { RefreshToken } from '@/models';
import { DomainError } from '@/shared/errors';
import { createRefreshTokenValue, hashRefreshToken } from '@/shared/refresh-token';
import { RefreshTokenRepositoryPort, UserRepositoryPort } from '@/repositories';
import type { TokenRefreshInput } from './token-refresh.dto';

interface Dependencies {
  refreshTokenRepository: RefreshTokenRepositoryPort;
  userRepository: UserRepositoryPort;
}

export class TokenRefreshUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: TokenRefreshInput) {
    const tokenHash = hashRefreshToken(input.refreshToken);
    const existing = await this.dependencies.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!existing || !existing.isValid()) {
      throw new DomainError('Refresh token inválido ou expirado', 'AUTH.INVALID_REFRESH_TOKEN');
    }

    const user = await this.dependencies.userRepository.findById(existing.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new DomainError('Refresh token inválido ou expirado', 'AUTH.INVALID_REFRESH_TOKEN');
    }

    // Rotação: revoga o token usado e emite um novo — se um refresh token
    // vazado for reaproveitado depois de já ter sido usado, ele já estará inválido.
    existing.revoke();
    await this.dependencies.refreshTokenRepository.update(existing);

    const { raw, tokenHash: newTokenHash, expiresAt } = createRefreshTokenValue();
    const rotated = RefreshToken.create({
      userId: user.id as string,
      tokenHash: newTokenHash,
      expiresAt,
      userAgent: input.userAgent,
    });
    await this.dependencies.refreshTokenRepository.create(rotated);

    const accessToken = await input.jwtSign({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    });

    return { accessToken, refreshToken: raw };
  }
}
