import { FinancePeriod } from '@/models';

export interface FinancePeriodRepositoryPort {
  /** Sempre devolve um período; se não houver linha, devolve o mês como aberto. */
  find(year: number, month: number): Promise<FinancePeriod>;
  save(period: FinancePeriod): Promise<FinancePeriod>;
  findClosedInYear(year: number): Promise<FinancePeriod[]>;
}
