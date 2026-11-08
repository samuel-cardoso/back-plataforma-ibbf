import { randomUUID } from 'node:crypto';
import { FinanceTransaction } from '@/models';
import {
  CashAccountRepositoryPort,
  FinanceAuditLogRepositoryPort,
  FinancePeriodRepositoryPort,
  FinanceTransactionRepositoryPort,
  FundRepositoryPort,
} from '@/repositories';
import { DomainError, NotFoundError } from '@/shared/errors';
import { assertPeriodOpen } from '../shared/finance-period.helpers';
import type { FinanceTransferCreateInput } from './finance-transfer-create.dto';

interface Dependencies {
  financeTransactionRepository: FinanceTransactionRepositoryPort;
  fundRepository: FundRepositoryPort;
  cashAccountRepository: CashAccountRepositoryPort;
  financePeriodRepository: FinancePeriodRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

/**
 * Move dinheiro entre contas (ex.: depósito do caixa no banco) e/ou entre fundos.
 * Gera duas linhas TRANSFER com o mesmo `transferGroupId`: uma saída e uma entrada.
 */
export class FinanceTransferCreateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceTransferCreateInput): Promise<FinanceTransaction[]> {
    const fundChanges = input.from.fundId !== input.to.fundId;
    const accountChanges = input.from.cashAccountId !== input.to.cashAccountId;
    if (!fundChanges && !accountChanges) {
      throw new DomainError('Origem e destino da transferência são iguais', 'FINANCE.INVALID_TRANSFER');
    }
    if (fundChanges && !input.approvalReference?.trim()) {
      throw new DomainError(
        'Transferência entre fundos exige a referência da aprovação (ex.: ata)',
        'FINANCE.APPROVAL_REQUIRED'
      );
    }

    const [fromFund, toFund] = await Promise.all([
      this.dependencies.fundRepository.findById(input.from.fundId),
      this.dependencies.fundRepository.findById(input.to.fundId),
    ]);
    if (!fromFund || !toFund) throw new NotFoundError('Fundo');

    const [fromAccount, toAccount] = await Promise.all([
      this.dependencies.cashAccountRepository.findById(input.from.cashAccountId),
      this.dependencies.cashAccountRepository.findById(input.to.cashAccountId),
    ]);
    if (!fromAccount || !toAccount) throw new NotFoundError('Conta');
    if (!toFund.active || !toAccount.active) {
      throw new DomainError('O destino da transferência está inativo', 'FINANCE.TRANSFER_TARGET_INACTIVE');
    }

    await assertPeriodOpen(this.dependencies.financePeriodRepository, input.date);

    if (fromFund.restricted) {
      const balance = await this.dependencies.financeTransactionRepository.getFundBalance(fromFund.id as string);
      if (balance - input.amountCents < 0) {
        throw new DomainError(
          `Saldo insuficiente no fundo ${fromFund.name}: recursos designados não podem ficar negativos`,
          'FINANCE.FUND_INSUFFICIENT'
        );
      }
    }

    const transferGroupId = randomUUID();
    const common = {
      kind: 'TRANSFER' as const,
      date: input.date,
      description: input.description,
      approvalReference: input.approvalReference,
      transferGroupId,
      createdById: input.userId,
    };
    const created = await this.dependencies.financeTransactionRepository.createMany([
      FinanceTransaction.create({ ...common, amountCents: -input.amountCents, ...input.from }),
      FinanceTransaction.create({ ...common, amountCents: input.amountCents, ...input.to }),
    ]);

    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'CREATE',
      entity: 'FinanceTransfer',
      entityId: transferGroupId,
      data: created.map((transaction) => transaction.toJSON()),
    });

    return Promise.all(
      created.map(async (transaction) =>
        (await this.dependencies.financeTransactionRepository.findById(transaction.id as string)) ?? transaction
      )
    );
  }
}
