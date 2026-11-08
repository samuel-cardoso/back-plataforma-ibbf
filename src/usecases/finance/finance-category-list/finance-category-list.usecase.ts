import { FinanceCategoryRepositoryPort } from '@/repositories';
import type { FinanceCategoryListInput } from './finance-category-list.dto';

interface Dependencies {
  financeCategoryRepository: FinanceCategoryRepositoryPort;
}

export class FinanceCategoryListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceCategoryListInput) {
    return this.dependencies.financeCategoryRepository.findAll({ type: input.type, activeOnly: input.activeOnly });
  }
}
