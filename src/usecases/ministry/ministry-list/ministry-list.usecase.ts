import { MinistryRepositoryPort } from '@/repositories';
import { PAGINATION } from '@/shared/constants';
import type { MinistryListInput } from './ministry-list.dto';

interface Dependencies {
  ministryRepository: MinistryRepositoryPort;
}

export class MinistryListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MinistryListInput) {
    const page = input.page ?? PAGINATION.DEFAULT_PAGE;
    const limit = input.limit ?? PAGINATION.DEFAULT_LIMIT;

    const result = await this.dependencies.ministryRepository.findMany({ search: input.search }, { page, limit });
    const totalPages = Math.ceil(result.total / limit);

    return { ministries: result.data, pagination: { total: result.total, page, limit, totalPages } };
  }
}
