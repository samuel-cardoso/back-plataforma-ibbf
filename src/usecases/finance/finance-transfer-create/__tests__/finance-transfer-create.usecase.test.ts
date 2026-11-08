import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CashAccount, FinancePeriod, Fund } from '@/models';
import { FinanceTransferCreateUseCase } from '../finance-transfer-create.usecase';

const fund = (id: string, restricted: boolean) =>
  Fund.restore({ id, name: id, restricted, active: true, pixTxid: null, sortOrder: 0, createdAt: new Date() });
const account = (id: string, kind: 'CASH' | 'BANK') =>
  CashAccount.restore({ id, name: id, kind, bankName: null, active: true, createdAt: new Date() });

function makeDeps() {
  const funds = new Map([['general', fund('general', false)], ['missions', fund('missions', true)]]);
  const accounts = new Map([['cash', account('cash', 'CASH')], ['bank', account('bank', 'BANK')]]);
  return {
    financeTransactionRepository: {
      createMany: vi.fn().mockImplementation(async (txs) => txs),
      findById: vi.fn().mockResolvedValue(null),
      getFundBalance: vi.fn().mockResolvedValue(100_000),
    },
    fundRepository: { findById: vi.fn().mockImplementation(async (id: string) => funds.get(id) ?? null) },
    cashAccountRepository: { findById: vi.fn().mockImplementation(async (id: string) => accounts.get(id) ?? null) },
    financePeriodRepository: { find: vi.fn().mockImplementation(async (y: number, m: number) => FinancePeriod.open(y, m)) },
    financeAuditLogRepository: { record: vi.fn() },
  };
}

describe('FinanceTransferCreateUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: FinanceTransferCreateUseCase;
  const base = { date: new Date('2026-11-08'), amountCents: 30_000, userId: 'user-1' };

  beforeEach(() => {
    deps = makeDeps();
    usecase = new FinanceTransferCreateUseCase(deps as never);
  });

  it('depósito do caixa no banco gera duas pernas que se anulam', async () => {
    const legs = await usecase.execute({
      ...base,
      from: { fundId: 'general', cashAccountId: 'cash' },
      to: { fundId: 'general', cashAccountId: 'bank' },
    });

    expect(legs.map((leg) => leg.amountCents)).toEqual([-30_000, 30_000]);
    expect(legs[0]?.transferGroupId).toBe(legs[1]?.transferGroupId);
  });

  it('exige referência de aprovação para mover entre fundos', async () => {
    await expect(
      usecase.execute({ ...base, from: { fundId: 'missions', cashAccountId: 'bank' }, to: { fundId: 'general', cashAccountId: 'bank' } })
    ).rejects.toMatchObject({ code: 'FINANCE.APPROVAL_REQUIRED' });
  });

  it('não deixa o fundo restrito de origem ficar negativo', async () => {
    deps.financeTransactionRepository.getFundBalance.mockResolvedValueOnce(10_000);

    await expect(
      usecase.execute({
        ...base,
        approvalReference: 'Ata 10/03',
        from: { fundId: 'missions', cashAccountId: 'bank' },
        to: { fundId: 'general', cashAccountId: 'bank' },
      })
    ).rejects.toMatchObject({ code: 'FINANCE.FUND_INSUFFICIENT' });
  });

  it('rejeita transferência com origem igual ao destino', async () => {
    await expect(
      usecase.execute({ ...base, from: { fundId: 'general', cashAccountId: 'cash' }, to: { fundId: 'general', cashAccountId: 'cash' } })
    ).rejects.toMatchObject({ code: 'FINANCE.INVALID_TRANSFER' });
  });
});
