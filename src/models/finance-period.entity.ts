import { DomainError } from '@/shared/errors';

export type FinancePeriodStatus = 'OPEN' | 'CLOSED';

export type FinancePeriodProps = {
  id: string | null;
  year: number;
  month: number;
  status: FinancePeriodStatus;
  closedById: string | null;
  closedAt: Date | null;
  reopenReason: string | null;
};

/** Mês contábil. Fechado, não aceita lançamentos com data dentro dele. */
export class FinancePeriod {
  private constructor(private props: FinancePeriodProps) {}

  /** Período ainda sem linha no banco = mês aberto. */
  static open(year: number, month: number): FinancePeriod {
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      throw new DomainError('Mês inválido', 'FINANCE_PERIOD.INVALID');
    }
    return new FinancePeriod({ id: null, year, month, status: 'OPEN', closedById: null, closedAt: null, reopenReason: null });
  }

  static restore(props: FinancePeriodProps): FinancePeriod {
    return new FinancePeriod({ ...props });
  }

  get id() { return this.props.id; }
  get year() { return this.props.year; }
  get month() { return this.props.month; }
  get status() { return this.props.status; }
  get isClosed() { return this.props.status === 'CLOSED'; }
  get closedById() { return this.props.closedById; }
  get closedAt() { return this.props.closedAt; }
  get reopenReason() { return this.props.reopenReason; }

  close(userId: string, now: Date = new Date()) {
    if (this.isClosed) throw new DomainError('Este mês já está fechado', 'FINANCE_PERIOD.ALREADY_CLOSED');
    this.props.status = 'CLOSED';
    this.props.closedById = userId;
    this.props.closedAt = now;
  }

  reopen(reason: string) {
    if (!this.isClosed) throw new DomainError('Este mês já está aberto', 'FINANCE_PERIOD.NOT_CLOSED');
    const trimmed = reason?.trim();
    if (!trimmed) throw new DomainError('Informe o motivo da reabertura', 'FINANCE_PERIOD.REOPEN_REASON_REQUIRED');
    this.props.status = 'OPEN';
    this.props.closedById = null;
    this.props.closedAt = null;
    this.props.reopenReason = trimmed;
  }

  toJSON() {
    return {
      id: this.props.id,
      year: this.props.year,
      month: this.props.month,
      status: this.props.status,
      closedById: this.props.closedById,
      closedAt: this.props.closedAt?.toISOString() ?? null,
      reopenReason: this.props.reopenReason,
    };
  }
}
