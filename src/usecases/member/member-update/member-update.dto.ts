import type { MemberStatus, MemberType } from '@/models';

export interface MemberUpdateInput {
  id: string;
  fullName?: string;
  cpf?: string | null;
  birthDate?: Date;
  phone?: string | null;
  address?: string | null;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  joinedAt?: Date;
  baptized?: boolean;
  familyId?: string | null;
  userId?: string | null;
}
