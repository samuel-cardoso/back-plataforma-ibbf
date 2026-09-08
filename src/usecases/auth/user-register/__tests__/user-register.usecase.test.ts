import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRegisterUseCase } from '../user-register.usecase';
import type { UserRegisterInput } from '../user-register.dto';

function makeDeps() {
  return {
    userRepository: {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (user) => user),
      findById: vi.fn(),
      updateLastLogin: vi.fn(),
      updatePassword: vi.fn(),
    },
    roleRepository: {
      findByName: vi.fn().mockResolvedValue({ id: 'role-membro', name: 'Membro', level: 20, description: null }),
    },
    refreshTokenRepository: {
      create: vi.fn().mockImplementation(async (refreshToken) => refreshToken),
      findByTokenHash: vi.fn(),
      update: vi.fn(),
    },
    emailVerificationCodeRepository: {
      create: vi.fn().mockImplementation(async (code) => code),
      findValidByUserAndCodeHash: vi.fn(),
      update: vi.fn(),
    },
    mailerService: {
      sendPasswordResetCode: vi.fn().mockResolvedValue(undefined),
      sendEmailVerificationCode: vi.fn().mockResolvedValue(undefined),
    },
  };
}

function makeInput(overrides: Partial<UserRegisterInput> = {}): UserRegisterInput {
  return {
    email: 'maria@example.com',
    password: 'senha123',
    jwtSign: vi.fn().mockResolvedValue('fake-jwt-token'),
    ...overrides,
  };
}

describe('UserRegisterUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: UserRegisterUseCase;

  beforeEach(() => {
    deps = makeDeps();
    usecase = new UserRegisterUseCase(deps as never);
  });

  it('cria o usuário com a role padrão, assina o token e envia o código de verificação por email', async () => {
    const input = makeInput();
    const result = await usecase.execute(input);

    expect(deps.userRepository.create).toHaveBeenCalledTimes(1);
    expect(result.user.email).toBe('maria@example.com');
    expect(result.user.roleId).toBe('role-membro');
    expect(result.accessToken).toBe('fake-jwt-token');
    expect(deps.refreshTokenRepository.create).toHaveBeenCalledTimes(1);
    expect(result.refreshToken).toEqual(expect.any(String));

    expect(deps.emailVerificationCodeRepository.create).toHaveBeenCalledTimes(1);
    expect(deps.mailerService.sendEmailVerificationCode).toHaveBeenCalledWith({
      to: 'maria@example.com',
      code: expect.stringMatching(/^\d{6}$/),
    });

    // Recém-criado, então o JWT sai com emailVerifiedAt: null (front usa isso pra decidir redirecionar ou não).
    expect(input.jwtSign).toHaveBeenCalledWith(expect.objectContaining({ emailVerifiedAt: null }));
  });

  it('conclui o registro e devolve os tokens mesmo se o envio do email de verificação falhar', async () => {
    deps.mailerService.sendEmailVerificationCode.mockRejectedValueOnce(new Error('Resend indisponível'));

    const result = await usecase.execute(makeInput());

    expect(result.accessToken).toBe('fake-jwt-token');
    expect(result.refreshToken).toEqual(expect.any(String));
  });

  it('rejeita com DomainError USER.EMAIL_ALREADY_EXISTS se o email já está em uso', async () => {
    deps.userRepository.findByEmail.mockResolvedValueOnce({ id: 'user-1', email: 'maria@example.com' });

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({
      code: 'USER.EMAIL_ALREADY_EXISTS',
    });
    expect(deps.userRepository.create).not.toHaveBeenCalled();
    expect(deps.mailerService.sendEmailVerificationCode).not.toHaveBeenCalled();
  });

  it('nunca grava a senha em texto puro (o hash é feito por User.create)', async () => {
    const result = await usecase.execute(makeInput({ password: 'senha123' }));

    expect(result.user.passwordHash).not.toBe('senha123');
  });

  it('lança erro se a role padrão não estiver configurada (seed ausente)', async () => {
    deps.roleRepository.findByName.mockResolvedValueOnce(null);

    await expect(usecase.execute(makeInput())).rejects.toThrow(/Membro/);
  });
});
