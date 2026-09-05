import { MemberRepositoryPort } from '@/repositories';
import { PAGINATION } from '@/shared/constants';
import type { MemberListInput } from './member-list.dto';

interface Dependencies {
  memberRepository: MemberRepositoryPort;
}

export class MemberListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MemberListInput) {
    const page = input.page ?? PAGINATION.DEFAULT_PAGE;
    const limit = input.limit ?? PAGINATION.DEFAULT_LIMIT;

    const result = await this.dependencies.memberRepository.findMany(
      {
        search: input.search,
        memberType: input.memberType,
        memberStatus: input.memberStatus,
        familyId: input.familyId,
      },
      { page, limit }
    );
    const totalPages = Math.ceil(result.total / limit);

    return {
      members: result.data,
      pagination: { total: result.total, page, limit, totalPages },
    };
  }
}
