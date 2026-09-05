import { MemberMinistry } from '@/models';
import { MemberMinistryRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { MinistryMemberUpdateRoleInput } from './ministry-member-update-role.dto';

interface Dependencies {
  memberMinistryRepository: MemberMinistryRepositoryPort;
}

export class MinistryMemberUpdateRoleUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MinistryMemberUpdateRoleInput): Promise<MemberMinistry> {
    const participation = await this.dependencies.memberMinistryRepository.findByMemberAndMinistry(
      input.memberId,
      input.ministryId
    );
    if (!participation) throw new NotFoundError('Participação');

    participation.update({ role: input.role });

    return this.dependencies.memberMinistryRepository.update(participation);
  }
}
