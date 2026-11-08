import { FinanceCategory } from '@/models';
import { FinanceCategoryRepositoryPort, FinanceAuditLogRepositoryPort } from '@/repositories';
import type { FinanceCategoryCreateInput } from './finance-category-create.dto';

interface Dependencies {
  financeCategoryRepository: FinanceCategoryRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FinanceCategoryCreateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceCategoryCreateInput & { userId: string }): Promise<FinanceCategory> {
    const created = await this.dependencies.financeCategoryRepository.create(FinanceCategory.create({ name: input.name, type: input.type, parentId: input.parentId, accountingCode: input.accountingCode }));
    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'CREATE',
      entity: 'FinanceCategory',
      entityId: created.id,
      data: created.toJSON(),
    });
    return created;
  }
}
