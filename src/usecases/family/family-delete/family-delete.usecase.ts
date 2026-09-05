import { FamilyRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { FamilyDeleteInput } from './family-delete.dto';

interface Dependencies {
  familyRepository: FamilyRepositoryPort;
}

export class FamilyDeleteUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FamilyDeleteInput): Promise<void> {
    const family = await this.dependencies.familyRepository.findById(input.id);
    if (!family) throw new NotFoundError('Família');

    await this.dependencies.familyRepository.delete(input.id);
  }
}
