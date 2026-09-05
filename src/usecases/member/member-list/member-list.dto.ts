import type { MemberStatus, MemberType } from '@/models';

export interface MemberListInput {
  page?: number;
  limit?: number;
  search?: string;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  familyId?: string;
}
