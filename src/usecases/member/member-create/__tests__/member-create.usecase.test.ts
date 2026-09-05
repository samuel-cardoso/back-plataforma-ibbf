import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemberCreateUseCase } from '../member-create.usecase';
import type { MemberCreateInput } from '../member-create.dto';

function makeDeps() {
  return {
    memberRepository: {
      create: vi.fn().mockImplementation(async (member) => member),
      findById: vi.fn(),
      findByCpf: vi.fn().mockResolvedValue(null),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function makeInput(overrides: Partial<MemberCreateInput> = {}): MemberCreateInput {
  return {
    fullName: 'João Silva',
    birthDate: new Date('1990-05-20'),
    memberType: 'MEMBER',
    ...overrides,
  };
}

describe('MemberCreateUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: MemberCreateUseCase;

  beforeEach(() => {
    deps = makeDeps();
    usecase = new MemberCreateUseCase(deps as never);
  });

  it('cria o membro quando os dados são válidos', async () => {
    const member = await usecase.execute(makeInput());

    expect(deps.memberRepository.create).toHaveBeenCalledTimes(1);
    expect(member.fullName).toBe('João Silva');
    expect(member.memberStatus).toBe('ACTIVE');
  });

  it('rejeita com DomainError MEMBER.CPF_ALREADY_EXISTS se o CPF já está em uso', async () => {
    deps.memberRepository.findByCpf.mockResolvedValueOnce({ id: 'member-1' });

    await expect(usecase.execute(makeInput({ cpf: '123.456.789-00' }))).rejects.toMatchObject({
      code: 'MEMBER.CPF_ALREADY_EXISTS',
    });
    expect(deps.memberRepository.create).not.toHaveBeenCalled();
  });

  it('rejeita com DomainError MEMBER.INVALID_FULL_NAME se o nome estiver vazio', async () => {
    await expect(usecase.execute(makeInput({ fullName: '  ' }))).rejects.toMatchObject({
      code: 'MEMBER.INVALID_FULL_NAME',
    });
  });
});
