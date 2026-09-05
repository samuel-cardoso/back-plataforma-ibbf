import { Member, MemberStatus, MemberType } from '@/models';

export interface MemberListFilters {
  search?: string;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  familyId?: string;
}

export interface MemberRepositoryPort {
  create(member: Member): Promise<Member>;
  findById(id: string): Promise<Member | null>;
  findByCpf(cpf: string): Promise<Member | null>;
  findMany(
    filters: MemberListFilters,
    pagination: { page: number; limit: number }
  ): Promise<{ data: Member[]; total: number }>;
  update(member: Member): Promise<Member>;
  delete(id: string): Promise<void>;
}
