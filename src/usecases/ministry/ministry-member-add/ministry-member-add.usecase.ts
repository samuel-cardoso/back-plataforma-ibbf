import { MemberMinistry } from '@/models';
import { MemberMinistryRepositoryPort } from '@/repositories';
import { DomainError } from '@/shared/errors';
import type { MinistryMemberAddInput } from './ministry-member-add.dto';

interface Dependencies {
  memberMinistryRepository: MemberMinistryRepositoryPort;
}

export class MinistryMemberAddUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MinistryMemberAddInput): Promise<MemberMinistry> {
    const existing = await this.dependencies.memberMinistryRepository.findByMemberAndMinistry(
      input.memberId,
      input.ministryId
    );
    if (existing) {
      throw new DomainError('Membro já participa deste ministério', 'MEMBER_MINISTRY.ALREADY_PARTICIPATING');
    }

    const participation = MemberMinistry.create({
      memberId: input.memberId,
      ministryId: input.ministryId,
      role: input.role,
      joinedAt: input.joinedAt,
    });

    return this.dependencies.memberMinistryRepository.create(participation);
  }
}
