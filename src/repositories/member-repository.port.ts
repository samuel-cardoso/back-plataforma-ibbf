import { Member } from '@/models';

export interface MemberRepositoryPort {
  create(member: Member): Promise<Member>;
  findById(id: string): Promise<Member | null>;
  findByCpf(cpf: string): Promise<Member | null>;
  findMany(
    filters: { search?: string },
    pagination: { page: number; limit: number }
  ): Promise<{ data: Member[]; total: number }>;
  update(member: Member): Promise<Member>;
  delete(id: string): Promise<void>;
}
