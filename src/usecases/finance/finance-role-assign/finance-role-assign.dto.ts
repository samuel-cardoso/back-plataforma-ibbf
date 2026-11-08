import type { FinanceRoleName } from '@/models';

export interface FinanceRoleAssignInput {
  targetUserId: string;
  role: FinanceRoleName;
  canViewIndividualGiving: boolean;
  userId: string;
}
