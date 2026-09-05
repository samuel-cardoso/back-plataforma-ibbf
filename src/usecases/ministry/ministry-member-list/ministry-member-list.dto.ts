import type { MemberMinistryRole } from '@/models';

export interface MinistryMemberListInput {
  ministryId: string;
  page?: number;
  limit?: number;
  role?: MemberMinistryRole;
}
