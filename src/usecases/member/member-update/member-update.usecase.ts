import { Member } from '@/models';
import { MemberRepositoryPort } from '@/repositories';
import { DomainError, NotFoundError } from '@/shared/errors';
import type { MemberUpdateInput } from './member-update.dto';

interface Dependencies {
  memberRepository: MemberRepositoryPort;
}

export class MemberUpdateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MemberUpdateInput): Promise<Member> {
    const member = await this.dependencies.memberRepository.findById(input.id);
    if (!member) throw new NotFoundError('Membro');

    if (input.cpf) {
      const digits = input.cpf.replace(/\D/g, '');
      const existing = await this.dependencies.memberRepository.findByCpf(digits);
      if (existing && existing.id !== member.id) {
        throw new DomainError('CPF já cadastrado para outro membro', 'MEMBER.CPF_ALREADY_EXISTS');
      }
    }

    member.update({
      fullName: input.fullName,
      cpf: input.cpf,
      birthDate: input.birthDate,
      phone: input.phone,
      address: input.address,
      memberType: input.memberType,
      memberStatus: input.memberStatus,
      joinedAt: input.joinedAt,
      baptized: input.baptized,
      familyId: input.familyId,
      userId: input.userId,
    });

    return this.dependencies.memberRepository.update(member);
  }
}
