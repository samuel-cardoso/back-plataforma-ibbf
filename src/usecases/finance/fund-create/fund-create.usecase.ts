import { Fund } from '@/models';
import { FundRepositoryPort, FinanceAuditLogRepositoryPort } from '@/repositories';
import type { FundCreateInput } from './fund-create.dto';

interface Dependencies {
  fundRepository: FundRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FundCreateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FundCreateInput & { userId: string }): Promise<Fund> {
    const created = await this.dependencies.fundRepository.create(Fund.create({ name: input.name, restricted: input.restricted, pixTxid: input.pixTxid, sortOrder: input.sortOrder }));
    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'CREATE',
      entity: 'Fund',
      entityId: created.id,
      data: created.toJSON(),
    });
    return created;
  }
}
