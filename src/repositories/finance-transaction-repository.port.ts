import { FinanceTransaction, FinanceTransactionKind } from '@/models';

export interface FinanceTransactionListFilters {
  from?: Date;
  to?: Date;
  fundId?: string;
  cashAccountId?: string;
  categoryId?: string;
  kind?: FinanceTransactionKind;
  search?: string;
}

export interface FinanceBalances {
  byFund: { fundId: string; balanceCents: number }[];
  byAccount: { cashAccountId: string; balanceCents: number }[];
}

export interface FinancePeriodSummary {
  incomeByFund: { fundId: string; amountCents: number }[];
  incomeByCategory: { categoryId: string; amountCents: number }[];
  expenseByCategory: { categoryId: string; amountCents: number }[];
}

export interface FinanceTransactionRepositoryPort {
  /** Grava todas as linhas atomicamente (ex.: as duas pernas de uma transferência). */
  createMany(transactions: FinanceTransaction[]): Promise<FinanceTransaction[]>;
  findById(id: string): Promise<FinanceTransaction | null>;
  findByTransferGroup(transferGroupId: string): Promise<FinanceTransaction[]>;
  isReversed(id: string): Promise<boolean>;
  /** Lista com os nomes de fundo/conta/categoria/membro preenchidos (join), mais recentes primeiro. */
  findMany(
    filters: FinanceTransactionListFilters,
    pagination: { page: number; limit: number }
  ): Promise<{ data: FinanceTransaction[]; total: number }>;
  getFundBalance(fundId: string): Promise<number>;
  getBalances(): Promise<FinanceBalances>;
  /** Entradas e saídas (já líquidas de estornos) de INCOME/EXPENSE entre `from` e `to`, inclusive. */
  getSummary(range: { from: Date; to: Date }): Promise<FinancePeriodSummary>;
}
