import { Fund } from '@/models';
import { FundRepositoryPort, FinanceAuditLogRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { FundUpdateInput } from './fund-update.dto';

interface Dependencies {
  fundRepository: FundRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FundUpdateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FundUpdateInput & { userId: string }): Promise<Fund> {
    const existing = await this.dependencies.fundRepository.findById(input.id);
    if (!existing) throw new NotFoundError('Fundo');

    const before = existing.toJSON();
    existing.update({ name: input.name, active: input.active, pixTxid: input.pixTxid, sortOrder: input.sortOrder });
    const updated = await this.dependencies.fundRepository.update(existing);

    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'UPDATE',
      entity: 'Fund',
      entityId: updated.id,
      data: { before, after: updated.toJSON() },
    });
    return updated;
  }
}
