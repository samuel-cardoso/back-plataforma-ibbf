import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResetPasswordUseCase } from '../reset-password.usecase';
import type { ResetPasswordInput } from '../reset-password.dto';

function makeResetCode(overrides: Partial<{ valid: boolean }> = {}) {
  return {
    id: 'code-1',
    userId: 'user-1',
    usedAt: null as Date | null,
    isValid: vi.fn().mockReturnValue(overrides.valid ?? true),
    markUsed: vi.fn(function (this: { usedAt: Date | null }) {
      this.usedAt = new Date();
    }),
  };
}

function makeUser() {
  return {
    id: 'user-1',
    email: 'maria@example.com',
  };
}

function makeDeps(options: {
  user?: ReturnType<typeof makeUser> | null;
  resetCode?: ReturnType<typeof makeResetCode> | null;
} = {}) {
  const user = 'user' in options ? options.user : makeUser();
  const resetCode = 'resetCode' in options ? options.resetCode : makeResetCode();

  return {
    userRepository: {
      findByEmail: vi.fn().mockResolvedValue(user),
      create: vi.fn(),
      findById: vi.fn(),
      updateLastLogin: vi.fn(),
      updatePassword: vi.fn(),
    },
    passwordResetCodeRepository: {
      create: vi.fn(),
      findValidByUserAndCodeHash: vi.fn().mockResolvedValue(resetCode),
      update: vi.fn(),
    },
  };
}

function makeInput(overrides: Partial<ResetPasswordInput> = {}): ResetPasswordInput {
  return {
    email: 'maria@example.com',
    code: '123456',
    newPassword: 'senha-nova-123',
    ...overrides,
  };
}

describe('ResetPasswordUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;

  beforeEach(() => {
    deps = makeDeps();
  });

  it('troca a senha, marca o código como usado quando o código confere e é válido', async () => {
    const usecase = new ResetPasswordUseCase(deps as never);

    await usecase.execute(makeInput());

    expect(deps.passwordResetCodeRepository.update).toHaveBeenCalledTimes(1);
    expect(deps.userRepository.updatePassword).toHaveBeenCalledTimes(1);
    const [id, newHash] = deps.userRepository.updatePassword.mock.calls[0];
    expect(id).toBe('user-1');
    expect(newHash).not.toBe('senha-nova-123');
  });

  it('rejeita com AUTH.INVALID_RESET_CODE se o email não existe', async () => {
    deps = makeDeps({ user: null });
    const usecase = new ResetPasswordUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'AUTH.INVALID_RESET_CODE' });
    expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('rejeita com AUTH.INVALID_RESET_CODE se nenhum código válido é encontrado', async () => {
    deps = makeDeps({ resetCode: null });
    const usecase = new ResetPasswordUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'AUTH.INVALID_RESET_CODE' });
    expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('rejeita com AUTH.INVALID_RESET_CODE se o código encontrado não é mais válido', async () => {
    deps = makeDeps({ resetCode: makeResetCode({ valid: false }) });
    const usecase = new ResetPasswordUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'AUTH.INVALID_RESET_CODE' });
    expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
  });
});
