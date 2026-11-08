import type { PaymentMethod } from '@/models';

export interface FinanceTransactionCreateInput {
  kind: 'INCOME' | 'EXPENSE' | 'OPENING_BALANCE';
  date: Date;
  amountCents: number;
  fundId: string;
  cashAccountId: string;
  categoryId?: string;
  method?: PaymentMethod;
  memberId?: string;
  description?: string;
  documentNumber?: string;
  userId: string;
  canViewIndividualGiving: boolean;
}
