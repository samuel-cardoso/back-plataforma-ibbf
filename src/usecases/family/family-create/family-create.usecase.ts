import { Family } from '@/models';
import { FamilyRepositoryPort } from '@/repositories';
import type { FamilyCreateInput } from './family-create.dto';

interface Dependencies {
  familyRepository: FamilyRepositoryPort;
}

export class FamilyCreateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FamilyCreateInput): Promise<Family> {
    const family = Family.create({ name: input.name });
    return this.dependencies.familyRepository.create(family);
  }
}
