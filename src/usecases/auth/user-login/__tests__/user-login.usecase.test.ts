import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserLoginUseCase } from '../user-login.usecase';
import type { UserLoginInput } from '../user-login.dto';

function makeUser(overrides: Partial<{ status: string; passwordMatches: boolean; emailVerifiedAt: Date | null }> = {}) {
  return {
    id: 'user-1',
    email: 'maria@example.com',
    roleId: 'role-membro',
    status: overrides.status ?? 'ACTIVE',
    lastLoginAt: null as Date | null,
    emailVerifiedAt: 'emailVerifiedAt' in overrides ? overrides.emailVerifiedAt ?? null : null,
    comparePassword: vi.fn().mockResolvedValue(overrides.passwordMatches ?? true),
    recordLogin: vi.fn(function (this: { lastLoginAt: Date | null }) {
      this.lastLoginAt = new Date();
    }),
  };
}

function makeDeps(user: ReturnType<typeof makeUser> | null = makeUser()) {
  return {
    userRepository: {
      findByEmail: vi.fn().mockResolvedValue(user),
      create: vi.fn(),
      findById: vi.fn(),
      updateLastLogin: vi.fn(),
    },
    refreshTokenRepository: {
      create: vi.fn().mockImplementation(async (refreshToken) => refreshToken),
      findByTokenHash: vi.fn(),
      update: vi.fn(),
    },
  };
}

function makeInput(overrides: Partial<UserLoginInput> = {}): UserLoginInput {
  return {
    email: 'maria@example.com',
    password: 'senha123',
    jwtSign: vi.fn().mockResolvedValue('fake-jwt-token'),
    ...overrides,
  };
}

describe('UserLoginUseCase', () => {
  it('autentica, registra o último login e assina o token quando as credenciais são válidas', async () => {
    const user = makeUser();
    const deps = makeDeps(user);
    const usecase = new UserLoginUseCase(deps as never);

    const result = await usecase.execute(makeInput());

    expect(user.recordLogin).toHaveBeenCalledTimes(1);
    expect(deps.userRepository.updateLastLogin).toHaveBeenCalledWith('user-1', expect.any(Date));
    expect(result.accessToken).toBe('fake-jwt-token');
    expect(deps.refreshTokenRepository.create).toHaveBeenCalledTimes(1);
    expect(result.refreshToken).toEqual(expect.any(String));
  });

  it('rejeita com USER.INVALID_CREDENTIALS se o usuário não existe', async () => {
    const deps = makeDeps(null);
    const usecase = new UserLoginUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'USER.INVALID_CREDENTIALS' });
  });

  it('rejeita com USER.INVALID_CREDENTIALS se o usuário está bloqueado/inativo', async () => {
    const deps = makeDeps(makeUser({ status: 'BLOCKED' }));
    const usecase = new UserLoginUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'USER.INVALID_CREDENTIALS' });
  });

  it('rejeita com USER.INVALID_CREDENTIALS se a senha não confere', async () => {
    const deps = makeDeps(makeUser({ passwordMatches: false }));
    const usecase = new UserLoginUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'USER.INVALID_CREDENTIALS' });
  });

  it('inclui emailVerifiedAt (ISO string) no payload assinado quando o email já foi confirmado', async () => {
    const verifiedAt = new Date('2026-01-01T00:00:00.000Z');
    const deps = makeDeps(makeUser({ emailVerifiedAt: verifiedAt }));
    const input = makeInput();
    const usecase = new UserLoginUseCase(deps as never);

    await usecase.execute(input);

    expect(input.jwtSign).toHaveBeenCalledWith(expect.objectContaining({ emailVerifiedAt: verifiedAt.toISOString() }));
  });

  it('inclui emailVerifiedAt: null no payload assinado quando o email ainda não foi confirmado', async () => {
    const deps = makeDeps(makeUser({ emailVerifiedAt: null }));
    const input = makeInput();
    const usecase = new UserLoginUseCase(deps as never);

    await usecase.execute(input);

    expect(input.jwtSign).toHaveBeenCalledWith(expect.objectContaining({ emailVerifiedAt: null }));
  });
});
