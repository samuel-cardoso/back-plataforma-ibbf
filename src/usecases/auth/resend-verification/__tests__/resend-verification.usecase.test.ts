import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResendVerificationUseCase } from '../resend-verification.usecase';
import type { ResendVerificationInput } from '../resend-verification.dto';

function makeUser(overrides: Partial<{ emailVerifiedAt: Date | null }> = {}) {
  return {
    id: 'user-1',
    email: 'maria@example.com',
    emailVerifiedAt: 'emailVerifiedAt' in overrides ? overrides.emailVerifiedAt : null,
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
      updateEmailVerifiedAt: vi.fn(),
    },
    emailVerificationCodeRepository: {
      create: vi.fn().mockImplementation(async (code) => code),
      findValidByUserAndCodeHash: vi.fn(),
      update: vi.fn(),
    },
    mailerService: {
      sendPasswordResetCode: vi.fn(),
      sendEmailVerificationCode: vi.fn().mockResolvedValue(undefined),
    },
  };
}

function makeInput(overrides: Partial<ResendVerificationInput> = {}): ResendVerificationInput {
  return {
    email: 'maria@example.com',
    ...overrides,
  };
}

describe('ResendVerificationUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;

  beforeEach(() => {
    deps = makeDeps();
  });

  it('gera um novo código e envia o email quando o usuário existe e ainda não verificou', async () => {
    const usecase = new ResendVerificationUseCase(deps as never);

    await usecase.execute(makeInput());

    expect(deps.emailVerificationCodeRepository.create).toHaveBeenCalledTimes(1);
    expect(deps.mailerService.sendEmailVerificationCode).toHaveBeenCalledWith({
      to: 'maria@example.com',
      code: expect.stringMatching(/^\d{6}$/),
    });
  });

  it('não envia nada se o usuário não existe', async () => {
    deps = makeDeps(null);
    const usecase = new ResendVerificationUseCase(deps as never);

    await usecase.execute(makeInput());

    expect(deps.mailerService.sendEmailVerificationCode).not.toHaveBeenCalled();
  });

  it('não envia nada se o email já foi verificado', async () => {
    deps = makeDeps(makeUser({ emailVerifiedAt: new Date() }));
    const usecase = new ResendVerificationUseCase(deps as never);

    await usecase.execute(makeInput());

    expect(deps.mailerService.sendEmailVerificationCode).not.toHaveBeenCalled();
  });
});
