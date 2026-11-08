import type { FinanceTransactionKind } from '@/models';

export interface FinanceTransactionListInput {
  page?: number;
  limit?: number;
  from?: Date;
  to?: Date;
  fundId?: string;
  cashAccountId?: string;
  categoryId?: string;
  kind?: FinanceTransactionKind;
  search?: string;
  userId: string;
  canViewIndividualGiving: boolean;
}
