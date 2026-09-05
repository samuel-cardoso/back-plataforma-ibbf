import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Member } from '@/models';
import { MemberUpdateUseCase } from '../member-update.usecase';

function makeExistingMember() {
  return Member.restore({
    id: 'member-1',
    userId: null,
    familyId: null,
    fullName: 'João Silva',
    cpf: null,
    birthDate: new Date('1990-05-20'),
    phone: null,
    address: null,
    memberType: 'MEMBER',
    memberStatus: 'ACTIVE',
    joinedAt: new Date('2020-01-01'),
    baptized: false,
  });
}

function makeDeps() {
  return {
    memberRepository: {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(makeExistingMember()),
      findByCpf: vi.fn().mockResolvedValue(null),
      findMany: vi.fn(),
      update: vi.fn().mockImplementation(async (member) => member),
      delete: vi.fn(),
    },
  };
}

describe('MemberUpdateUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: MemberUpdateUseCase;

  beforeEach(() => {
    deps = makeDeps();
    usecase = new MemberUpdateUseCase(deps as never);
  });

  it('atualiza os campos informados', async () => {
    const updated = await usecase.execute({ id: 'member-1', fullName: 'João da Silva', baptized: true });

    expect(updated.fullName).toBe('João da Silva');
    expect(updated.baptized).toBe(true);
    expect(deps.memberRepository.update).toHaveBeenCalledTimes(1);
  });

  it('lança NotFoundError se o membro não existe', async () => {
    deps.memberRepository.findById.mockResolvedValueOnce(null);

    await expect(usecase.execute({ id: 'missing', fullName: 'X' })).rejects.toThrow('Membro não encontrado.');
  });

  it('rejeita com MEMBER.CPF_ALREADY_EXISTS se o novo CPF pertence a outro membro', async () => {
    deps.memberRepository.findByCpf.mockResolvedValueOnce({ id: 'other-member' });

    await expect(usecase.execute({ id: 'member-1', cpf: '123.456.789-00' })).rejects.toMatchObject({
      code: 'MEMBER.CPF_ALREADY_EXISTS',
    });
  });
});
