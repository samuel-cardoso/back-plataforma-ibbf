import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordUseCase } from '../forgot-password.usecase';
import type { ForgotPasswordInput } from '../forgot-password.dto';

function makeUser(overrides: Partial<{ status: string }> = {}) {
  return {
    id: 'user-1',
    email: 'maria@example.com',
    status: overrides.status ?? 'ACTIVE',
  };
}

function makeDeps(user: ReturnType<typeof makeUser> | null = makeUser()) {
  return {
    userRepository: {
      findByEmail: vi.fn().mockResolvedValue(user),
      create: vi.fn(),
      findById: vi.fn(),
      updateLastLogin: vi.fn(),
      updatePassword: vi.fn(),
    },
    passwordResetCodeRepository: {
      create: vi.fn().mockImplementation(async (code) => code),
      findValidByUserAndCodeHash: vi.fn(),
      update: vi.fn(),
    },
    mailerService: {
      sendPasswordResetCode: vi.fn().mockResolvedValue(undefined),
    },
  };
}

function makeInput(overrides: Partial<ForgotPasswordInput> = {}): ForgotPasswordInput {
  return {
    email: 'maria@example.com',
    ...overrides,
  };
}

describe('ForgotPasswordUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;

  beforeEach(() => {
    deps = makeDeps();
  });

  it('gera um código, persiste e envia o email quando o usuário existe e está ativo', async () => {
    const usecase = new ForgotPasswordUseCase(deps as never);

    await usecase.execute(makeInput());

    expect(deps.passwordResetCodeRepository.create).toHaveBeenCalledTimes(1);
    expect(deps.mailerService.sendPasswordResetCode).toHaveBeenCalledWith({
      to: 'maria@example.com',
      code: expect.stringMatching(/^\d{6}$/),
    });
  });

  it('não envia email nem gera código se o usuário não existe', async () => {
    deps = makeDeps(null);
    const usecase = new ForgotPasswordUseCase(deps as never);

    await usecase.execute(makeInput());

    expect(deps.passwordResetCodeRepository.create).not.toHaveBeenCalled();
    expect(deps.mailerService.sendPasswordResetCode).not.toHaveBeenCalled();
  });

  it('não envia email nem gera código se o usuário não está ACTIVE', async () => {
    deps = makeDeps(makeUser({ status: 'BLOCKED' }));
    const usecase = new ForgotPasswordUseCase(deps as never);

    await usecase.execute(makeInput());

    expect(deps.passwordResetCodeRepository.create).not.toHaveBeenCalled();
    expect(deps.mailerService.sendPasswordResetCode).not.toHaveBeenCalled();
  });
});
