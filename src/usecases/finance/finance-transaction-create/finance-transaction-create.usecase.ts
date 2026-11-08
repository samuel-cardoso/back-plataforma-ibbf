import { FinanceTransaction } from '@/models';
import {
  CashAccountRepositoryPort,
  FinanceAuditLogRepositoryPort,
  FinanceCategoryRepositoryPort,
  FinancePeriodRepositoryPort,
  FinanceTransactionRepositoryPort,
  FundRepositoryPort,
} from '@/repositories';
import { DomainError, NotFoundError } from '@/shared/errors';
import { assertPeriodOpen } from '../shared/finance-period.helpers';
import type { FinanceTransactionCreateInput } from './finance-transaction-create.dto';

interface Dependencies {
  financeTransactionRepository: FinanceTransactionRepositoryPort;
  fundRepository: FundRepositoryPort;
  cashAccountRepository: CashAccountRepositoryPort;
  financeCategoryRepository: FinanceCategoryRepositoryPort;
  financePeriodRepository: FinancePeriodRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FinanceTransactionCreateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceTransactionCreateInput): Promise<FinanceTransaction> {
    const fund = await this.dependencies.fundRepository.findById(input.fundId);
    if (!fund) throw new NotFoundError('Fundo');
    if (!fund.active) throw new DomainError('Fundo inativo', 'FINANCE.FUND_INACTIVE');

    const account = await this.dependencies.cashAccountRepository.findById(input.cashAccountId);
    if (!account) throw new NotFoundError('Conta');
    if (!account.active) throw new DomainError('Conta inativa', 'FINANCE.ACCOUNT_INACTIVE');

    if (input.kind !== 'OPENING_BALANCE') {
      if (!input.categoryId) throw new DomainError('Categoria é obrigatória', 'FINANCE.CATEGORY_REQUIRED');
      const category = await this.dependencies.financeCategoryRepository.findById(input.categoryId);
      if (!category) throw new NotFoundError('Categoria');
      if (category.type !== input.kind) {
        throw new DomainError('Categoria não corresponde ao tipo do lançamento', 'FINANCE.CATEGORY_TYPE_MISMATCH');
      }
      if (!category.active) throw new DomainError('Categoria inativa', 'FINANCE.CATEGORY_INACTIVE');
    }

    if (input.memberId && !input.canViewIndividualGiving) {
      throw new DomainError(
        'Você não tem permissão para registrar contribuições identificadas',
        'FINANCE.INDIVIDUAL_GIVING_FORBIDDEN'
      );
    }

    await assertPeriodOpen(this.dependencies.financePeriodRepository, input.date);

    const amountCents = input.kind === 'EXPENSE' ? -input.amountCents : input.amountCents;

    if (amountCents < 0 && fund.restricted) {
      const balance = await this.dependencies.financeTransactionRepository.getFundBalance(fund.id as string);
      if (balance + amountCents < 0) {
        throw new DomainError(
          `Saldo insuficiente no fundo ${fund.name}: recursos designados não podem ficar negativos`,
          'FINANCE.FUND_INSUFFICIENT'
        );
      }
    }

    const transaction = FinanceTransaction.create({
      kind: input.kind,
      date: input.date,
      amountCents,
      fundId: fund.id as string,
      cashAccountId: account.id as string,
      categoryId: input.kind === 'OPENING_BALANCE' ? null : input.categoryId,
      method: input.method,
      memberId: input.memberId,
      description: input.description,
      documentNumber: input.documentNumber,
      createdById: input.userId,
    });

    const [created] = await this.dependencies.financeTransactionRepository.createMany([transaction]);
    const saved = created as FinanceTransaction;

    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'CREATE',
      entity: 'FinanceTransaction',
      entityId: saved.id,
      data: saved.toJSON({ includeMember: true }),
    });

    return (await this.dependencies.financeTransactionRepository.findById(saved.id as string)) ?? saved;
  }
}
