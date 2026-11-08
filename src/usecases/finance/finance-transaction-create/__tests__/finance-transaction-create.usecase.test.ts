import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CashAccount, FinanceCategory, FinancePeriod, Fund } from '@/models';
import { FinanceTransactionCreateUseCase } from '../finance-transaction-create.usecase';
import type { FinanceTransactionCreateInput } from '../finance-transaction-create.dto';

const generalFund = Fund.restore({ id: 'fund-general', name: 'Geral', restricted: false, active: true, pixTxid: null, sortOrder: 0, createdAt: new Date() });
const missionsFund = Fund.restore({ id: 'fund-missions', name: 'Missões', restricted: true, active: true, pixTxid: null, sortOrder: 1, createdAt: new Date() });
const cash = CashAccount.restore({ id: 'acc-cash', name: 'Caixa', kind: 'CASH', bankName: null, active: true, createdAt: new Date() });
const tithes = FinanceCategory.restore({ id: 'cat-tithes', name: 'Dízimos', type: 'INCOME', parentId: null, accountingCode: null, active: true, createdAt: new Date() });
const support = FinanceCategory.restore({ id: 'cat-support', name: 'Sustento missionário', type: 'EXPENSE', parentId: null, accountingCode: null, active: true, createdAt: new Date() });

function makeDeps() {
  const funds = new Map([[generalFund.id, generalFund], [missionsFund.id, missionsFund]]);
  const categories = new Map([[tithes.id, tithes], [support.id, support]]);
  return {
    financeTransactionRepository: {
      createMany: vi.fn().mockImplementation(async (txs) => txs),
      findById: vi.fn().mockResolvedValue(null),
      getFundBalance: vi.fn().mockResolvedValue(0),
    },
    fundRepository: { findById: vi.fn().mockImplementation(async (id: string) => funds.get(id) ?? null) },
    cashAccountRepository: { findById: vi.fn().mockResolvedValue(cash) },
    financeCategoryRepository: { findById: vi.fn().mockImplementation(async (id: string) => categories.get(id) ?? null) },
    financePeriodRepository: { find: vi.fn().mockImplementation(async (y: number, m: number) => FinancePeriod.open(y, m)) },
    financeAuditLogRepository: { record: vi.fn() },
  };
}

function makeInput(overrides: Partial<FinanceTransactionCreateInput> = {}): FinanceTransactionCreateInput {
  return {
    kind: 'INCOME',
    date: new Date('2026-11-08'),
    amountCents: 10_000,
    fundId: 'fund-general',
    cashAccountId: 'acc-cash',
    categoryId: 'cat-tithes',
    userId: 'user-1',
    canViewIndividualGiving: false,
    ...overrides,
  };
}

describe('FinanceTransactionCreateUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: FinanceTransactionCreateUseCase;

  beforeEach(() => {
    deps = makeDeps();
    usecase = new FinanceTransactionCreateUseCase(deps as never);
  });

  it('grava entrada com valor positivo e registra auditoria', async () => {
    const transaction = await usecase.execute(makeInput());

    expect(transaction.amountCents).toBe(10_000);
    expect(deps.financeAuditLogRepository.record).toHaveBeenCalledTimes(1);
  });

  it('grava despesa com valor negativo', async () => {
    const transaction = await usecase.execute(makeInput({ kind: 'EXPENSE', categoryId: 'cat-support' }));

    expect(transaction.amountCents).toBe(-10_000);
  });

  it('bloqueia despesa que deixaria fundo restrito negativo', async () => {
    deps.financeTransactionRepository.getFundBalance.mockResolvedValueOnce(5_000);

    await expect(
      usecase.execute(makeInput({ kind: 'EXPENSE', categoryId: 'cat-support', fundId: 'fund-missions' }))
    ).rejects.toMatchObject({ code: 'FINANCE.FUND_INSUFFICIENT' });
    expect(deps.financeTransactionRepository.createMany).not.toHaveBeenCalled();
  });

  it('permite despesa no fundo geral mesmo sem saldo (não restrito)', async () => {
    await expect(usecase.execute(makeInput({ kind: 'EXPENSE', categoryId: 'cat-support' }))).resolves.toBeTruthy();
    expect(deps.financeTransactionRepository.getFundBalance).not.toHaveBeenCalled();
  });

  it('bloqueia lançamento em mês fechado', async () => {
    const closed = FinancePeriod.open(2026, 11);
    closed.close('user-1');
    deps.financePeriodRepository.find.mockResolvedValueOnce(closed);

    await expect(usecase.execute(makeInput())).rejects.toMatchObject({ code: 'FINANCE.PERIOD_CLOSED' });
  });

  it('rejeita categoria de tipo diferente do lançamento', async () => {
    await expect(usecase.execute(makeInput({ categoryId: 'cat-support' }))).rejects.toMatchObject({
      code: 'FINANCE.CATEGORY_TYPE_MISMATCH',
    });
  });

  it('exige permissão para vincular a contribuição a um membro', async () => {
    await expect(usecase.execute(makeInput({ memberId: 'member-1' }))).rejects.toMatchObject({
      code: 'FINANCE.INDIVIDUAL_GIVING_FORBIDDEN',
    });
    await expect(usecase.execute(makeInput({ memberId: 'member-1', canViewIndividualGiving: true }))).resolves.toBeTruthy();
  });

  it('saldo inicial dispensa categoria', async () => {
    const transaction = await usecase.execute(makeInput({ kind: 'OPENING_BALANCE', categoryId: undefined }));

    expect(transaction.categoryId).toBeNull();
  });
});
