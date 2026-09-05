import { Ministry } from '@/models';
import { MinistryRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { MinistryUpdateInput } from './ministry-update.dto';

interface Dependencies {
  ministryRepository: MinistryRepositoryPort;
}

export class MinistryUpdateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MinistryUpdateInput): Promise<Ministry> {
    const ministry = await this.dependencies.ministryRepository.findById(input.id);
    if (!ministry) throw new NotFoundError('Ministério');

    ministry.update({ name: input.name, leaderId: input.leaderId, description: input.description });

    return this.dependencies.ministryRepository.update(ministry);
  }
}
