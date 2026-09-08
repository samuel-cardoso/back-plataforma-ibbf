import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VerifyEmailUseCase } from '../verify-email.usecase';
import type { VerifyEmailInput } from '../verify-email.dto';

function makeVerificationCode(overrides: Partial<{ valid: boolean }> = {}) {
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

function makeUser(overrides: Partial<{ emailVerifiedAt: Date | null }> = {}) {
  return {
    id: 'user-1',
    email: 'maria@example.com',
    emailVerifiedAt: 'emailVerifiedAt' in overrides ? overrides.emailVerifiedAt : null,
    markEmailVerified: vi.fn(function (this: { emailVerifiedAt: Date | null }) {
      this.emailVerifiedAt = new Date();
    }),
  };
}

function makeDeps(options: {
  user?: ReturnType<typeof makeUser> | null;
  verificationCode?: ReturnType<typeof makeVerificationCode> | null;
} = {}) {
  const user = 'user' in options ? options.user : makeUser();
  const verificationCode = 'verificationCode' in options ? options.verificationCode : makeVerificationCode();

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
      create: vi.fn(),
      findValidByUserAndCodeHash: vi.fn().mockResolvedValue(verificationCode),
      update: vi.fn(),
    },
  };
}

function makeInput(overrides: Partial<VerifyEmailInput> = {}): VerifyEmailInput {
  return {
    email: 'maria@example.com',
    code: '123456',
    ...overrides,
  };
}

describe('VerifyEmailUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;

  beforeEach(() => {
    deps = makeDeps();
  });

  it('marca o email como verificado e o código como usado quando o código confere e é válido', async () => {
    const usecase = new VerifyEmailUseCase(deps as never);

    await usecase.execute(makeInput());

    expect(deps.emailVerificationCodeRepository.update).toHaveBeenCalledTimes(1);
    expect(deps.userRepository.updateEmailVerifiedAt).toHaveBeenCalledWith('user-1', expect.any(Date));
  });

  it('rejeita com AUTH.INVALID_VERIFICATION_CODE se o email não existe', async () => {
    deps = makeDeps({ user: null });
    const usecase = new VerifyEmailUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'AUTH.INVALID_VERIFICATION_CODE' });
    expect(deps.userRepository.updateEmailVerifiedAt).not.toHaveBeenCalled();
  });

  it('rejeita com AUTH.EMAIL_ALREADY_VERIFIED se o email já foi verificado antes', async () => {
    deps = makeDeps({ user: makeUser({ emailVerifiedAt: new Date() }) });
    const usecase = new VerifyEmailUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'AUTH.EMAIL_ALREADY_VERIFIED' });
    expect(deps.userRepository.updateEmailVerifiedAt).not.toHaveBeenCalled();
  });

  it('rejeita com AUTH.INVALID_VERIFICATION_CODE se nenhum código válido é encontrado', async () => {
    deps = makeDeps({ verificationCode: null });
    const usecase = new VerifyEmailUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'AUTH.INVALID_VERIFICATION_CODE' });
    expect(deps.userRepository.updateEmailVerifiedAt).not.toHaveBeenCalled();
  });

  it('rejeita com AUTH.INVALID_VERIFICATION_CODE se o código encontrado não é mais válido', async () => {
    deps = makeDeps({ verificationCode: makeVerificationCode({ valid: false }) });
    const usecase = new VerifyEmailUseCase(deps as never);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'AUTH.INVALID_VERIFICATION_CODE' });
    expect(deps.userRepository.updateEmailVerifiedAt).not.toHaveBeenCalled();
  });
});
