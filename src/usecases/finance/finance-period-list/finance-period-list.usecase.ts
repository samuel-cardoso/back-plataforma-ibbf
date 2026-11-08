import { FinancePeriod } from '@/models';
import { FinancePeriodRepositoryPort } from '@/repositories';
import type { FinancePeriodListInput } from './finance-period-list.dto';

interface Dependencies {
  financePeriodRepository: FinancePeriodRepositoryPort;
}

/** Os 12 meses do ano, com o status de cada um (meses sem registro aparecem abertos). */
export class FinancePeriodListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinancePeriodListInput): Promise<FinancePeriod[]> {
    const closed = await this.dependencies.financePeriodRepository.findClosedInYear(input.year);
    const closedByMonth = new Map(closed.map((period) => [period.month, period]));
    return Array.from({ length: 12 }, (_, index) => closedByMonth.get(index + 1) ?? FinancePeriod.open(input.year, index + 1));
  }
}
