import { Ministry } from '@/models';
import { MinistryRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { MinistryDetailsInput } from './ministry-details.dto';

interface Dependencies {
  ministryRepository: MinistryRepositoryPort;
}

export class MinistryDetailsUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MinistryDetailsInput): Promise<Ministry> {
    const ministry = await this.dependencies.ministryRepository.findById(input.id);
    if (!ministry) throw new NotFoundError('Ministério');
    return ministry;
  }
}
