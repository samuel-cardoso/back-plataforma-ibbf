import { FinanceAuditLogRepositoryPort, FinanceTransactionRepositoryPort } from '@/repositories';
import { PAGINATION } from '@/shared/constants';
import type { FinanceTransactionListInput } from './finance-transaction-list.dto';

interface Dependencies {
  financeTransactionRepository: FinanceTransactionRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FinanceTransactionListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceTransactionListInput) {
    const page = input.page ?? PAGINATION.DEFAULT_PAGE;
    const limit = input.limit ?? PAGINATION.DEFAULT_LIMIT;
    const filters = {
      from: input.from,
      to: input.to,
      fundId: input.fundId,
      cashAccountId: input.cashAccountId,
      categoryId: input.categoryId,
      kind: input.kind,
      search: input.search,
    };

    const result = await this.dependencies.financeTransactionRepository.findMany(filters, { page, limit });

    // Toda consulta que expõe contribuição identificada fica registrada (LGPD: dado sensível).
    if (input.canViewIndividualGiving && result.data.some((transaction) => transaction.memberId)) {
      await this.dependencies.financeAuditLogRepository.record({
        userId: input.userId,
        action: 'VIEW_INDIVIDUAL_GIVING',
        entity: 'FinanceTransaction',
        data: { filters, page, limit },
      });
    }

    return {
      transactions: result.data,
      pagination: { total: result.total, page, limit, totalPages: Math.ceil(result.total / limit) },
    };
  }
}
