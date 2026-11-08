import { randomUUID } from 'node:crypto';
import { FinanceTransaction } from '@/models';
import {
  FinanceAuditLogRepositoryPort,
  FinancePeriodRepositoryPort,
  FinanceTransactionRepositoryPort,
  FundRepositoryPort,
} from '@/repositories';
import { DomainError, NotFoundError } from '@/shared/errors';
import { assertPeriodOpen, today } from '../shared/finance-period.helpers';
import type { FinanceTransactionReverseInput } from './finance-transaction-reverse.dto';

interface Dependencies {
  financeTransactionRepository: FinanceTransactionRepositoryPort;
  fundRepository: FundRepositoryPort;
  financePeriodRepository: FinancePeriodRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

/**
 * Anula um lançamento criando a(s) linha(s) espelho. Em transferência, estorna as duas pernas juntas.
 * O lançamento original nunca é alterado — por isso dá para estornar algo de um mês já fechado.
 */
export class FinanceTransactionReverseUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceTransactionReverseInput): Promise<FinanceTransaction[]> {
    const original = await this.dependencies.financeTransactionRepository.findById(input.id);
    if (!original) throw new NotFoundError('Lançamento');

    const originals = original.transferGroupId
      ? await this.dependencies.financeTransactionRepository.findByTransferGroup(original.transferGroupId)
      : [original];

    for (const transaction of originals) {
      if (await this.dependencies.financeTransactionRepository.isReversed(transaction.id as string)) {
        throw new DomainError('Este lançamento já foi estornado', 'FINANCE.ALREADY_REVERSED');
      }
    }

    const date = input.date ?? today();
    await assertPeriodOpen(this.dependencies.financePeriodRepository, date);

    const transferGroupId = original.transferGroupId ? randomUUID() : null;
    const reversals = originals.map((transaction) =>
      transaction.reversal({ date, createdById: input.userId, reason: input.reason, transferGroupId })
    );

    await this.assertRestrictedFundsStayNonNegative(reversals);

    const created = await this.dependencies.financeTransactionRepository.createMany(reversals);

    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'REVERSE',
      entity: 'FinanceTransaction',
      entityId: original.id,
      data: { reason: input.reason, reversals: created.map((transaction) => transaction.toJSON()) },
    });

    return Promise.all(
      created.map(async (transaction) =>
        (await this.dependencies.financeTransactionRepository.findById(transaction.id as string)) ?? transaction
      )
    );
  }

  private async assertRestrictedFundsStayNonNegative(reversals: FinanceTransaction[]) {
    const deltaByFund = new Map<string, number>();
    for (const reversal of reversals) {
      deltaByFund.set(reversal.fundId, (deltaByFund.get(reversal.fundId) ?? 0) + reversal.amountCents);
    }

    for (const [fundId, delta] of deltaByFund) {
      if (delta >= 0) continue;
      const fund = await this.dependencies.fundRepository.findById(fundId);
      if (!fund?.restricted) continue;
      const balance = await this.dependencies.financeTransactionRepository.getFundBalance(fundId);
      if (balance + delta < 0) {
        throw new DomainError(
          `O estorno deixaria o fundo ${fund.name} negativo`,
          'FINANCE.FUND_INSUFFICIENT'
        );
      }
    }
  }
}
