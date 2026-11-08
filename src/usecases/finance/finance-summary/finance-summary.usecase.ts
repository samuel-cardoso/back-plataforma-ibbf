import {
  CashAccountRepositoryPort,
  FinanceCategoryRepositoryPort,
  FinancePeriodRepositoryPort,
  FinanceTransactionRepositoryPort,
  FundRepositoryPort,
} from '@/repositories';
import { monthRange } from '../shared/finance-period.helpers';
import type { FinanceSummaryInput } from './finance-summary.dto';

interface Dependencies {
  financeTransactionRepository: FinanceTransactionRepositoryPort;
  fundRepository: FundRepositoryPort;
  cashAccountRepository: CashAccountRepositoryPort;
  financeCategoryRepository: FinanceCategoryRepositoryPort;
  financePeriodRepository: FinancePeriodRepositoryPort;
}

/** Painel: saldos atuais por fundo e por conta + entradas/saídas do mês pedido. Só agregados. */
export class FinanceSummaryUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceSummaryInput) {
    const [funds, accounts, categories, balances, summary, period] = await Promise.all([
      this.dependencies.fundRepository.findAll({}),
      this.dependencies.cashAccountRepository.findAll({}),
      this.dependencies.financeCategoryRepository.findAll({}),
      this.dependencies.financeTransactionRepository.getBalances(),
      this.dependencies.financeTransactionRepository.getSummary(monthRange(input.year, input.month)),
      this.dependencies.financePeriodRepository.find(input.year, input.month),
    ]);

    const fundBalance = new Map(balances.byFund.map((row) => [row.fundId, row.balanceCents]));
    const accountBalance = new Map(balances.byAccount.map((row) => [row.cashAccountId, row.balanceCents]));
    const fundName = new Map(funds.map((fund) => [fund.id as string, fund.name]));
    const categoryName = new Map(categories.map((category) => [category.id as string, category.name]));

    // Fundos/contas inativos só aparecem se ainda tiverem saldo.
    const fundRows = funds
      .map((fund) => ({ id: fund.id as string, name: fund.name, restricted: fund.restricted, active: fund.active, balanceCents: fundBalance.get(fund.id as string) ?? 0 }))
      .filter((row) => row.active || row.balanceCents !== 0)
      .map(({ active: _active, ...row }) => row);
    const accountRows = accounts
      .map((account) => ({ id: account.id as string, name: account.name, kind: account.kind, active: account.active, balanceCents: accountBalance.get(account.id as string) ?? 0 }))
      .filter((row) => row.active || row.balanceCents !== 0)
      .map(({ active: _active, ...row }) => row);

    const byAmountDesc = (a: { amountCents: number }, b: { amountCents: number }) => b.amountCents - a.amountCents;
    const incomeByFund = summary.incomeByFund
      .map((row) => ({ id: row.fundId, name: fundName.get(row.fundId) ?? '—', amountCents: row.amountCents }))
      .sort(byAmountDesc);
    const incomeByCategory = summary.incomeByCategory
      .map((row) => ({ id: row.categoryId, name: categoryName.get(row.categoryId) ?? '—', amountCents: row.amountCents }))
      .sort(byAmountDesc);
    const expenseByCategory = summary.expenseByCategory
      .map((row) => ({ id: row.categoryId, name: categoryName.get(row.categoryId) ?? '—', amountCents: row.amountCents }))
      .sort(byAmountDesc);
    const sum = (rows: { amountCents: number }[]) => rows.reduce((total, row) => total + row.amountCents, 0);

    return {
      period: { year: period.year, month: period.month, status: period.status },
      balances: {
        funds: fundRows,
        accounts: accountRows,
        totalCents: balances.byAccount.reduce((total, row) => total + row.balanceCents, 0),
      },
      month: {
        incomeByFund,
        incomeByCategory,
        expenseByCategory,
        totalIncomeCents: sum(incomeByCategory),
        totalExpenseCents: sum(expenseByCategory),
      },
    };
  }
}
