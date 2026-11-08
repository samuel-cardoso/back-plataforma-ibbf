import { FundRepositoryPort } from '@/repositories';
import type { FundListInput } from './fund-list.dto';

interface Dependencies {
  fundRepository: FundRepositoryPort;
}

export class FundListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FundListInput) {
    return this.dependencies.fundRepository.findAll({ activeOnly: input.activeOnly });
  }
}
