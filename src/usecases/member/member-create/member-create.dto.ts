import type { MemberStatus, MemberType } from '@/models';

export interface MemberCreateInput {
  fullName: string;
  cpf?: string;
  birthDate: Date;
  phone?: string;
  address?: string;
  memberType: MemberType;
  memberStatus?: MemberStatus;
  joinedAt?: Date;
  baptized?: boolean;
  userId?: string;
  familyId?: string;
}
