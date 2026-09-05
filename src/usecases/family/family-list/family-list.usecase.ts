import { FamilyRepositoryPort } from '@/repositories';
import { PAGINATION } from '@/shared/constants';
import type { FamilyListInput } from './family-list.dto';

interface Dependencies {
  familyRepository: FamilyRepositoryPort;
}

export class FamilyListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FamilyListInput) {
    const page = input.page ?? PAGINATION.DEFAULT_PAGE;
    const limit = input.limit ?? PAGINATION.DEFAULT_LIMIT;

    const result = await this.dependencies.familyRepository.findMany({ search: input.search }, { page, limit });
    const totalPages = Math.ceil(result.total / limit);

    return { families: result.data, pagination: { total: result.total, page, limit, totalPages } };
  }
}
