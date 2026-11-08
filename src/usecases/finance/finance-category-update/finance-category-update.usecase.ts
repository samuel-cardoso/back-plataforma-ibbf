import { FinanceCategory } from '@/models';
import { FinanceCategoryRepositoryPort, FinanceAuditLogRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { FinanceCategoryUpdateInput } from './finance-category-update.dto';

interface Dependencies {
  financeCategoryRepository: FinanceCategoryRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FinanceCategoryUpdateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceCategoryUpdateInput & { userId: string }): Promise<FinanceCategory> {
    const existing = await this.dependencies.financeCategoryRepository.findById(input.id);
    if (!existing) throw new NotFoundError('Categoria');

    const before = existing.toJSON();
    existing.update({ name: input.name, parentId: input.parentId, accountingCode: input.accountingCode, active: input.active });
    const updated = await this.dependencies.financeCategoryRepository.update(existing);

    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'UPDATE',
      entity: 'FinanceCategory',
      entityId: updated.id,
      data: { before, after: updated.toJSON() },
    });
    return updated;
  }
}
