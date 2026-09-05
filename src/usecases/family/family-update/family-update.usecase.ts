import { Family } from '@/models';
import { FamilyRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { FamilyUpdateInput } from './family-update.dto';

interface Dependencies {
  familyRepository: FamilyRepositoryPort;
}

export class FamilyUpdateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FamilyUpdateInput): Promise<Family> {
    const family = await this.dependencies.familyRepository.findById(input.id);
    if (!family) throw new NotFoundError('Família');

    family.update({ name: input.name });

    return this.dependencies.familyRepository.update(family);
  }
}
