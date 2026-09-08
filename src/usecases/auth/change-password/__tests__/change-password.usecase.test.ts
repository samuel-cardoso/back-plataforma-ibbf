import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChangePasswordUseCase } from '../change-password.usecase';
import type { ChangePasswordInput } from '../change-password.dto';

function makeUser(overrides: Partial<{ currentPasswordMatches: boolean }> = {}) {
  return {
    id: 'user-1',
    email: 'maria@example.com',
    passwordHash: 'old-hash',
    comparePassword: vi.fn().mockResolvedValue(overrides.currentPasswordMatches ?? true),
  };
}

function makeDeps(user: ReturnType<typeof makeUser> | null = makeUser()) {
  return {
    userRepository: {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(user),
      updateLastLogin: vi.fn(),
      updatePassword: vi.fn(),
    },
  };
}

function makeInput(overrides: Partial<ChangePasswordInput> = {}): ChangePasswordInput {
  return {
    userId: 'user-1',
    currentPassword: 'senha-atual',
    newPassword: 'senha-nova-123',
    ...overrides,
  };
}

describe('ChangePasswordUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;

  beforeEach(() => {
    deps = makeDeps();
  });

  it('atualiza a senha quando a senha atual confere', async () => {
    const usecase = new ChangePasswordUseCase(deps as never);

    await usecase.execute(makeInput());

    expect(deps.userRepository.updatePassword).toHaveBeenCalledTimes(1);
    const [id, newHash] = deps.userRepository.updatePassword.mock.calls[0];
    expect(id).toBe('user-1');
    expect(newHash).not.toBe('senha-nova-123');
  });

  it('rejeita com AUTH.INVALID_CURRENT_PASSWORD se a senha atual não confere', async () => {
    deps = makeDeps(makeUser({ currentPasswordMatches: false }));
    const usecase = new ChangePasswordUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'AUTH.INVALID_CURRENT_PASSWORD' });
    expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('lança NotFoundError se o usuário não existe', async () => {
    deps = makeDeps(null);
    const usecase = new ChangePasswordUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toThrow(/não encontrado/);
  });

  it('rejeita com USER.INVALID_PASSWORD se a nova senha for muito curta', async () => {
    const usecase = new ChangePasswordUseCase(deps as never);

    await expect(usecase.execute(makeInput({ newPassword: '123' }))).rejects.toMatchObject({
      code: 'USER.INVALID_PASSWORD',
    });
  });
});
