import { Ministry } from '@/models';
import { MinistryRepositoryPort } from '@/repositories';
import type { MinistryCreateInput } from './ministry-create.dto';

interface Dependencies {
  ministryRepository: MinistryRepositoryPort;
}

export class MinistryCreateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MinistryCreateInput): Promise<Ministry> {
    const ministry = Ministry.create({
      name: input.name,
      leaderId: input.leaderId,
      description: input.description,
    });

    return this.dependencies.ministryRepository.create(ministry);
  }
}
