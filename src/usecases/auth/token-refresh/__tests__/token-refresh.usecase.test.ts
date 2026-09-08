import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RefreshToken } from '@/models';
import { hashRefreshToken } from '@/shared/refresh-token';
import { TokenRefreshUseCase } from '../token-refresh.usecase';

const RAW_TOKEN = 'raw-refresh-token-value';

function makeValidRefreshToken(overrides: Partial<{ expiresAt: Date; revokedAt: Date | null }> = {}) {
  return RefreshToken.restore({
    id: 'refresh-1',
    userId: 'user-1',
    tokenHash: hashRefreshToken(RAW_TOKEN),
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 60_000),
    revokedAt: overrides.revokedAt ?? null,
    userAgent: null,
  });
}

function makeDeps() {
  return {
    refreshTokenRepository: {
      create: vi.fn().mockImplementation(async (refreshToken) => refreshToken),
      findByTokenHash: vi.fn().mockResolvedValue(makeValidRefreshToken()),
      update: vi.fn().mockImplementation(async (refreshToken) => refreshToken),
    },
    userRepository: {
      findByEmail: vi.fn(),
      create: vi.fn(),
      updateLastLogin: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'maria@example.com',
        roleId: 'role-1',
        status: 'ACTIVE',
        emailVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    },
  };
}

describe('TokenRefreshUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: TokenRefreshUseCase;

  beforeEach(() => {
    deps = makeDeps();
    usecase = new TokenRefreshUseCase(deps as never);
  });

  it('rotaciona o refresh token e emite um novo access token', async () => {
    const jwtSign = vi.fn().mockResolvedValue('new-jwt-token');

    const result = await usecase.execute({ refreshToken: RAW_TOKEN, jwtSign });

    expect(deps.refreshTokenRepository.update).toHaveBeenCalledTimes(1);
    expect(deps.refreshTokenRepository.create).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBe('new-jwt-token');
    expect(result.refreshToken).not.toBe(RAW_TOKEN);
    expect(jwtSign).toHaveBeenCalledWith(
      expect.objectContaining({ emailVerifiedAt: '2026-01-01T00:00:00.000Z' }),
    );
  });

  it('rejeita com AUTH.INVALID_REFRESH_TOKEN se o token não existe', async () => {
    deps.refreshTokenRepository.findByTokenHash.mockResolvedValueOnce(null);

    await expect(usecase.execute({ refreshToken: RAW_TOKEN, jwtSign: vi.fn() })).rejects.toMatchObject({
      code: 'AUTH.INVALID_REFRESH_TOKEN',
    });
  });

  it('rejeita com AUTH.INVALID_REFRESH_TOKEN se o token está expirado', async () => {
    deps.refreshTokenRepository.findByTokenHash.mockResolvedValueOnce(
      makeValidRefreshToken({ expiresAt: new Date(Date.now() - 1000) })
    );

    await expect(usecase.execute({ refreshToken: RAW_TOKEN, jwtSign: vi.fn() })).rejects.toMatchObject({
      code: 'AUTH.INVALID_REFRESH_TOKEN',
    });
  });

  it('rejeita com AUTH.INVALID_REFRESH_TOKEN se o token já foi revogado', async () => {
    deps.refreshTokenRepository.findByTokenHash.mockResolvedValueOnce(
      makeValidRefreshToken({ revokedAt: new Date() })
    );

    await expect(usecase.execute({ refreshToken: RAW_TOKEN, jwtSign: vi.fn() })).rejects.toMatchObject({
      code: 'AUTH.INVALID_REFRESH_TOKEN',
    });
  });

  it('rejeita com AUTH.INVALID_REFRESH_TOKEN se o usuário não está mais ACTIVE', async () => {
    deps.userRepository.findById.mockResolvedValueOnce({ id: 'user-1', status: 'BLOCKED' });

    await expect(usecase.execute({ refreshToken: RAW_TOKEN, jwtSign: vi.fn() })).rejects.toMatchObject({
      code: 'AUTH.INVALID_REFRESH_TOKEN',
    });
  });
});
