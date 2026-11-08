import { FinancePeriodRepositoryPort } from '@/repositories';
import { DomainError } from '@/shared/errors';

/** Ano/mês (UTC) de uma data de lançamento (`@db.Date`, sempre meia-noite UTC). */
export function monthOf(date: Date): { year: number; month: number } {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

/** Primeiro e último dia do mês, inclusive. */
export function monthRange(year: number, month: number): { from: Date; to: Date } {
  return { from: new Date(Date.UTC(year, month - 1, 1)), to: new Date(Date.UTC(year, month, 0)) };
}

/** Hoje como data pura (meia-noite UTC), para lançamentos sem data explícita. */
export function today(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function assertPeriodOpen(financePeriodRepository: FinancePeriodRepositoryPort, date: Date) {
  const { year, month } = monthOf(date);
  const period = await financePeriodRepository.find(year, month);
  if (period.isClosed) {
    throw new DomainError(
      `O mês ${String(month).padStart(2, '0')}/${year} está fechado para lançamentos`,
      'FINANCE.PERIOD_CLOSED'
    );
  }
}
