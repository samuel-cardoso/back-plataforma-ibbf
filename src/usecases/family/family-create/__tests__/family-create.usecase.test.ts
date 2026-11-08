import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FamilyCreateUseCase } from '../family-create.usecase';

function makeDeps() {
  return {
    familyRepository: {
      create: vi.fn().mockImplementation(async (family) => family),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe('FamilyCreateUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: FamilyCreateUseCase;

  beforeEach(() => {
    deps = makeDeps();
    usecase = new FamilyCreateUseCase(deps as never);
  });

  it('cria a família quando o nome é válido', async () => {
    const family = await usecase.execute({ name: 'Família Silva' });

    expect(deps.familyRepository.create).toHaveBeenCalledTimes(1);
    expect(family.name).toBe('Família Silva');
  });

  it('rejeita com DomainError FAMILY.INVALID_NAME se o nome estiver vazio', async () => {
    await expect(usecase.execute({ name: '  ' })).rejects.toMatchObject({ code: 'FAMILY.INVALID_NAME' });
    expect(deps.familyRepository.create).not.toHaveBeenCalled();
  });

  it('grava o endereço quando informado e normaliza vazio para null', async () => {
    const withAddress = await usecase.execute({ name: 'Família Silva', address: '  Rua das Flores, 123  ' });
    const withoutAddress = await usecase.execute({ name: 'Família Souza', address: '   ' });

    expect(withAddress.address).toBe('Rua das Flores, 123');
    expect(withoutAddress.address).toBeNull();
  });
});
