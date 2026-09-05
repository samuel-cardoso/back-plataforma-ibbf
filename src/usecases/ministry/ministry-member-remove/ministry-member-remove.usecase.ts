import { MemberMinistryRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { MinistryMemberRemoveInput } from './ministry-member-remove.dto';

interface Dependencies {
  memberMinistryRepository: MemberMinistryRepositoryPort;
}

export class MinistryMemberRemoveUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MinistryMemberRemoveInput): Promise<void> {
    const participation = await this.dependencies.memberMinistryRepository.findByMemberAndMinistry(
      input.memberId,
      input.ministryId
    );
    if (!participation) throw new NotFoundError('Participação');

    await this.dependencies.memberMinistryRepository.delete(participation.id as string);
  }
}
