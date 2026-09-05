import { MemberMinistryRepositoryPort } from '@/repositories';
import { PAGINATION } from '@/shared/constants';
import type { MinistryMemberListInput } from './ministry-member-list.dto';

interface Dependencies {
  memberMinistryRepository: MemberMinistryRepositoryPort;
}

export class MinistryMemberListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MinistryMemberListInput) {
    const page = input.page ?? PAGINATION.DEFAULT_PAGE;
    const limit = input.limit ?? PAGINATION.DEFAULT_LIMIT;

    const result = await this.dependencies.memberMinistryRepository.findManyByMinistry(input.ministryId, {
      page,
      limit,
    });
    const totalPages = Math.ceil(result.total / limit);

    return { participations: result.data, pagination: { total: result.total, page, limit, totalPages } };
  }
}
