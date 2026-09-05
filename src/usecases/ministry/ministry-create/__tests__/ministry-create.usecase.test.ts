import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MinistryCreateUseCase } from '../ministry-create.usecase';

function makeDeps() {
  return {
    ministryRepository: {
      create: vi.fn().mockImplementation(async (ministry) => ministry),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe('MinistryCreateUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: MinistryCreateUseCase;

  beforeEach(() => {
    deps = makeDeps();
    usecase = new MinistryCreateUseCase(deps as never);
  });

  it('cria o ministério quando o nome é válido', async () => {
    const ministry = await usecase.execute({ name: 'Louvor' });

    expect(deps.ministryRepository.create).toHaveBeenCalledTimes(1);
    expect(ministry.name).toBe('Louvor');
    expect(ministry.leaderId).toBeNull();
  });

  it('rejeita com DomainError MINISTRY.INVALID_NAME se o nome estiver vazio', async () => {
    await expect(usecase.execute({ name: '  ' })).rejects.toMatchObject({ code: 'MINISTRY.INVALID_NAME' });
    expect(deps.ministryRepository.create).not.toHaveBeenCalled();
  });
});
