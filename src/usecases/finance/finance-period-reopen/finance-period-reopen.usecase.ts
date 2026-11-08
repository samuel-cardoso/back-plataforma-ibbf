import { FinancePeriod } from '@/models';
import { FinanceAuditLogRepositoryPort, FinancePeriodRepositoryPort } from '@/repositories';
import type { FinancePeriodReopenInput } from './finance-period-reopen.dto';

interface Dependencies {
  financePeriodRepository: FinancePeriodRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FinancePeriodReopenUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinancePeriodReopenInput): Promise<FinancePeriod> {
    const period = await this.dependencies.financePeriodRepository.find(input.year, input.month);
    period.reopen(input.reason);
    const saved = await this.dependencies.financePeriodRepository.save(period);

    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'REOPEN',
      entity: 'FinancePeriod',
      entityId: saved.id,
      data: saved.toJSON(),
    });
    return saved;
  }
}
