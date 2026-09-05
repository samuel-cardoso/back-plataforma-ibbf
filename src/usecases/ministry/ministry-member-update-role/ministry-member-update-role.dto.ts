import type { MemberMinistryRole } from '@/models';

export interface MinistryMemberUpdateRoleInput {
  ministryId: string;
  memberId: string;
  role: MemberMinistryRole;
}
