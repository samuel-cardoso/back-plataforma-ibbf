import { FinancePeriod } from '@/models';
import { FinanceAuditLogRepositoryPort, FinancePeriodRepositoryPort } from '@/repositories';
import type { FinancePeriodCloseInput } from './finance-period-close.dto';

interface Dependencies {
  financePeriodRepository: FinancePeriodRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FinancePeriodCloseUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinancePeriodCloseInput): Promise<FinancePeriod> {
    const period = await this.dependencies.financePeriodRepository.find(input.year, input.month);
    period.close(input.userId);
    const saved = await this.dependencies.financePeriodRepository.save(period);

    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'CLOSE',
      entity: 'FinancePeriod',
      entityId: saved.id,
      data: saved.toJSON(),
    });
    return saved;
  }
}
