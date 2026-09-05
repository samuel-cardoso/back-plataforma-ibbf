import { Family } from '@/models';
import { FamilyRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { FamilyDetailsInput } from './family-details.dto';

interface Dependencies {
  familyRepository: FamilyRepositoryPort;
}

export class FamilyDetailsUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FamilyDetailsInput): Promise<Family> {
    const family = await this.dependencies.familyRepository.findById(input.id);
    if (!family) throw new NotFoundError('Família');
    return family;
  }
}
