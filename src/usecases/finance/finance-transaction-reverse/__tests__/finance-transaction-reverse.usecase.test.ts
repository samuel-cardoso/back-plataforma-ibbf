import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinancePeriod, FinanceTransaction, Fund } from '@/models';
import { FinanceTransactionReverseUseCase } from '../finance-transaction-reverse.usecase';

const tx = (overrides: Partial<Parameters<typeof FinanceTransaction.restore>[0]> = {}) =>
  FinanceTransaction.restore({
    id: 'tx-1', kind: 'INCOME', date: new Date('2026-10-05'), amountCents: 20_000, description: null,
    fundId: 'missions', cashAccountId: 'cash', categoryId: 'cat', method: 'CASH', memberId: null,
    documentNumber: null, transferGroupId: null, approvalReference: null, reversesId: null,
    createdById: 'user-1', createdAt: new Date(), ...overrides,
  });

function makeDeps() {
  return {
    financeTransactionRepository: {
      findById: vi.fn().mockImplementation(async (id: string) => (id === 'tx-1' ? tx() : null)),
      findByTransferGroup: vi.fn(),
      isReversed: vi.fn().mockResolvedValue(false),
      createMany: vi.fn().mockImplementation(async (txs) => txs),
      getFundBalance: vi.fn().mockResolvedValue(50_000),
    },
    fundRepository: {
      findById: vi.fn().mockResolvedValue(
        Fund.restore({ id: 'missions', name: 'Missões', restricted: true, active: true, pixTxid: null, sortOrder: 0, createdAt: new Date() })
      ),
    },
    financePeriodRepository: { find: vi.fn().mockImplementation(async (y: number, m: number) => FinancePeriod.open(y, m)) },
    financeAuditLogRepository: { record: vi.fn() },
  };
}

describe('FinanceTransactionReverseUseCase', () => {
  let deps: ReturnType<typeof makeDeps>;
  let usecase: FinanceTransactionReverseUseCase;

  beforeEach(() => {
    deps = makeDeps();
    usecase = new FinanceTransactionReverseUseCase(deps as never);
  });

  it('cria a linha espelho com valor oposto e vínculo ao original', async () => {
    const [reversal] = await usecase.execute({ id: 'tx-1', reason: 'valor digitado errado', date: new Date('2026-11-08'), userId: 'user-1' });

    expect(reversal?.amountCents).toBe(-20_000);
    expect(reversal?.reversesId).toBe('tx-1');
    expect(reversal?.description).toBe('Estorno: valor digitado errado');
  });

  it('não estorna duas vezes', async () => {
    deps.financeTransactionRepository.isReversed.mockResolvedValueOnce(true);

    await expect(usecase.execute({ id: 'tx-1', reason: 'x', userId: 'user-1' })).rejects.toMatchObject({
      code: 'FINANCE.ALREADY_REVERSED',
    });
  });

  it('estorna as duas pernas de uma transferência juntas', async () => {
    const out = tx({ id: 'out', kind: 'TRANSFER', amountCents: -5_000, fundId: 'general', categoryId: null, transferGroupId: 'g1' });
    const into = tx({ id: 'in', kind: 'TRANSFER', amountCents: 5_000, fundId: 'general', cashAccountId: 'bank', categoryId: null, transferGroupId: 'g1' });
    deps.financeTransactionRepository.findById.mockResolvedValueOnce(out);
    deps.financeTransactionRepository.findByTransferGroup.mockResolvedValueOnce([out, into]);
    deps.fundRepository.findById.mockResolvedValue(
      Fund.restore({ id: 'general', name: 'Geral', restricted: false, active: true, pixTxid: null, sortOrder: 0, createdAt: new Date() })
    );

    const reversals = await usecase.execute({ id: 'out', reason: 'depósito duplicado', userId: 'user-1' });

    expect(reversals.map((r) => r.amountCents)).toEqual([5_000, -5_000]);
    expect(reversals[0]?.transferGroupId).toBe(reversals[1]?.transferGroupId);
  });

  it('não deixa estorno de entrada zerar fundo restrito abaixo de zero', async () => {
    deps.financeTransactionRepository.getFundBalance.mockResolvedValueOnce(10_000);

    await expect(usecase.execute({ id: 'tx-1', reason: 'x', userId: 'user-1' })).rejects.toMatchObject({
      code: 'FINANCE.FUND_INSUFFICIENT',
    });
  });
});
