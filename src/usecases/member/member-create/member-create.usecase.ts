import { Member } from '@/models';
import { DomainError } from '@/shared/errors';
import { MemberRepositoryPort } from '@/repositories';
import type { MemberCreateInput } from './member-create.dto';

interface Dependencies {
  memberRepository: MemberRepositoryPort;
}

export class MemberCreateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: MemberCreateInput): Promise<Member> {
    if (input.cpf) {
      const digits = input.cpf.replace(/\D/g, '');
      const existing = await this.dependencies.memberRepository.findByCpf(digits);
      if (existing) {
        throw new DomainError('CPF já cadastrado para outro membro', 'MEMBER.CPF_ALREADY_EXISTS');
      }
    }

    const member = Member.create({
      fullName: input.fullName,
      cpf: input.cpf,
      birthDate: input.birthDate,
      phone: input.phone,
      address: input.address,
      memberType: input.memberType,
      memberStatus: input.memberStatus,
      joinedAt: input.joinedAt,
      baptized: input.baptized,
      userId: input.userId,
      familyId: input.familyId,
    });

    return this.dependencies.memberRepository.create(member);
  }
}
