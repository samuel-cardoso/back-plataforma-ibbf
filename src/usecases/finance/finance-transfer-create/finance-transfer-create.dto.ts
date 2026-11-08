export interface FinanceTransferCreateInput {
  date: Date;
  amountCents: number;
  from: { fundId: string; cashAccountId: string };
  to: { fundId: string; cashAccountId: string };
  description?: string;
  approvalReference?: string;
  userId: string;
}
