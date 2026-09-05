import type { MemberMinistryRole } from '@/models';

export interface MinistryMemberAddInput {
  ministryId: string;
  memberId: string;
  role?: MemberMinistryRole;
  joinedAt?: Date;
}
