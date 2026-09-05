import { MemberRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { MemberDeleteInput } from './member-delete.dto';

interface Dependencies {
  memberRepository: MemberRepositoryPort;
}

export class MemberDeleteUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MemberDeleteInput): Promise<void> {
    const member = await this.dependencies.memberRepository.findById(input.id);
    if (!member) throw new NotFoundError('Membro');

    await this.dependencies.memberRepository.delete(input.id);
  }
}
