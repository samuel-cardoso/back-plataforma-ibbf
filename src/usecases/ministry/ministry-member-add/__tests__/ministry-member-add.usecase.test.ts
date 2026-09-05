import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MinistryMemberAddUseCase } from '../ministry-member-add.usecase';

function makeDeps() {
  return {
    memberMinistryRepository: {
      create: vi.fn().mockImplementation(async (participation) => participation),
      findByMemberAndMinistry: vi.fn().mockResolvedValue(null),
      findManyByMinistry: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe('MinistryMemberAddUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: MinistryMemberAddUseCase;

  beforeEach(() => {
    deps = makeDeps();
    usecase = new MinistryMemberAddUseCase(deps as never);
  });

  it('adiciona o membro ao ministério quando ele ainda não participa', async () => {
    const participation = await usecase.execute({ ministryId: 'ministry-1', memberId: 'member-1' });

    expect(deps.memberMinistryRepository.create).toHaveBeenCalledTimes(1);
    expect(participation.role).toBe('MEMBER');
  });

  it('rejeita com MEMBER_MINISTRY.ALREADY_PARTICIPATING se o membro já participa', async () => {
    deps.memberMinistryRepository.findByMemberAndMinistry.mockResolvedValueOnce({ id: 'existing' });

    await expect(usecase.execute({ ministryId: 'ministry-1', memberId: 'member-1' })).rejects.toMatchObject({
      code: 'MEMBER_MINISTRY.ALREADY_PARTICIPATING',
    });
    expect(deps.memberMinistryRepository.create).not.toHaveBeenCalled();
  });
});
