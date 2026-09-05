import { hashRefreshToken } from '@/shared/refresh-token';
import { RefreshTokenRepositoryPort } from '@/repositories';
import type { LogoutInput } from './logout.dto';

interface Dependencies {
  refreshTokenRepository: RefreshTokenRepositoryPort;
}

/**
 * Idempotente por design: revoga o refresh token se ele existir e ainda for
 * válido, mas não informa ao cliente se o token era inválido/inexistente
 * (evita usar a resposta de logout para checar validade de tokens alheios).
 */
export class LogoutUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: LogoutInput): Promise<void> {
    const tokenHash = hashRefreshToken(input.refreshToken);
    const existing = await this.dependencies.refreshTokenRepository.findByTokenHash(tokenHash);

    if (existing && existing.isValid()) {
      existing.revoke();
      await this.dependencies.refreshTokenRepository.update(existing);
    }
  }
}
