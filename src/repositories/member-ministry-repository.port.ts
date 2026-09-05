import { MemberMinistry } from '@/models';

export interface MemberMinistryRepositoryPort {
  create(memberMinistry: MemberMinistry): Promise<MemberMinistry>;
  findByMemberAndMinistry(memberId: string, ministryId: string): Promise<MemberMinistry | null>;
  /** Lista participantes de um ministério, já com `memberName` preenchido (join). */
  findManyByMinistry(
    ministryId: string,
    pagination: { page: number; limit: number }
  ): Promise<{ data: MemberMinistry[]; total: number }>;
  update(memberMinistry: MemberMinistry): Promise<MemberMinistry>;
  delete(id: string): Promise<void>;
}
