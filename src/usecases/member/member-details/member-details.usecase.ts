import { Member } from '@/models';
import { MemberRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { MemberDetailsInput } from './member-details.dto';

interface Dependencies {
  memberRepository: MemberRepositoryPort;
}

export class MemberDetailsUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MemberDetailsInput): Promise<Member> {
    const member = await this.dependencies.memberRepository.findById(input.id);
    if (!member) throw new NotFoundError('Membro');
    return member;
  }
}
