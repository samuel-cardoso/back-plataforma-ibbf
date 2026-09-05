import { MinistryRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { MinistryDeleteInput } from './ministry-delete.dto';

interface Dependencies {
  ministryRepository: MinistryRepositoryPort;
}

export class MinistryDeleteUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MinistryDeleteInput): Promise<void> {
    const ministry = await this.dependencies.ministryRepository.findById(input.id);
    if (!ministry) throw new NotFoundError('Ministério');

    await this.dependencies.ministryRepository.delete(input.id);
  }
}
