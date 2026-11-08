import { DomainError } from '@/shared/errors';

export type FinanceTransactionKind = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'OPENING_BALANCE';
export type PaymentMethod = 'CASH' | 'PIX' | 'CARD' | 'BANK_TRANSFER' | 'CHECK' | 'BOLETO';

export type FinanceTransactionProps = {
  id: string | null;
  kind: FinanceTransactionKind;
  date: Date;
  /** Com sinal: positivo entra no fundo/conta, negativo sai. */
  amountCents: number;
  description: string | null;
  fundId: string;
  cashAccountId: string;
  categoryId: string | null;
  method: PaymentMethod | null;
  memberId: string | null;
  documentNumber: string | null;
  transferGroupId: string | null;
  approvalReference: string | null;
  reversesId: string | null;
  createdById: string;
  createdAt: Date;
  /** Campos de leitura (join), preenchidos só nas listagens. */
  fundName?: string;
  cashAccountName?: string;
  categoryName?: string | null;
  memberName?: string | null;
  reversedById?: string | null;
};

/**
 * Lançamento do livro-caixa. Imutável depois de criado: não há `update`.
 * Correção = `reversal()`, que gera a linha espelho com `reversesId`.
 */
export class FinanceTransaction {
  private constructor(private props: FinanceTransactionProps) {}

  static create(props: {
    kind: FinanceTransactionKind;
    date: Date;
    amountCents: number;
    fundId: string;
    cashAccountId: string;
    createdById: string;
    description?: string | null;
    categoryId?: string | null;
    method?: PaymentMethod | null;
    memberId?: string | null;
    documentNumber?: string | null;
    transferGroupId?: string | null;
    approvalReference?: string | null;
    reversesId?: string | null;
    now?: Date;
  }): FinanceTransaction {
    if (!Number.isInteger(props.amountCents) || props.amountCents === 0) {
      throw new DomainError('Valor do lançamento inválido', 'FINANCE.INVALID_AMOUNT');
    }
    if (!props.date || Number.isNaN(props.date.getTime())) {
      throw new DomainError('Data do lançamento inválida', 'FINANCE.INVALID_DATE');
    }
    if ((props.kind === 'INCOME' || props.kind === 'EXPENSE') && !props.categoryId) {
      throw new DomainError('Categoria é obrigatória', 'FINANCE.CATEGORY_REQUIRED');
    }
    if (props.memberId && props.kind !== 'INCOME') {
      throw new DomainError('Só entradas podem ser vinculadas a um membro', 'FINANCE.MEMBER_ONLY_ON_INCOME');
    }

    return new FinanceTransaction({
      id: null,
      kind: props.kind,
      date: props.date,
      amountCents: props.amountCents,
      description: props.description?.trim() || null,
      fundId: props.fundId,
      cashAccountId: props.cashAccountId,
      categoryId: props.categoryId ?? null,
      method: props.method ?? null,
      memberId: props.memberId ?? null,
      documentNumber: props.documentNumber?.trim() || null,
      transferGroupId: props.transferGroupId ?? null,
      approvalReference: props.approvalReference?.trim() || null,
      reversesId: props.reversesId ?? null,
      createdById: props.createdById,
      createdAt: props.now ?? new Date(),
    });
  }

  static restore(props: FinanceTransactionProps): FinanceTransaction {
    if (!props.id) throw new DomainError('Lançamento inválido (id ausente)', 'FINANCE.INVALID_STATE');
    return new FinanceTransaction({ ...props });
  }

  get id() { return this.props.id; }
  get kind() { return this.props.kind; }
  get date() { return this.props.date; }
  get amountCents() { return this.props.amountCents; }
  get description() { return this.props.description; }
  get fundId() { return this.props.fundId; }
  get cashAccountId() { return this.props.cashAccountId; }
  get categoryId() { return this.props.categoryId; }
  get method() { return this.props.method; }
  get memberId() { return this.props.memberId; }
  get documentNumber() { return this.props.documentNumber; }
  get transferGroupId() { return this.props.transferGroupId; }
  get approvalReference() { return this.props.approvalReference; }
  get reversesId() { return this.props.reversesId; }
  get createdById() { return this.props.createdById; }
  get createdAt() { return this.props.createdAt; }

  /** Linha espelho que anula esta, lançada na data do estorno (o mês original pode estar fechado). */
  reversal(input: { date: Date; createdById: string; reason: string; transferGroupId?: string | null }): FinanceTransaction {
    if (!this.props.id) throw new DomainError('Lançamento inválido (id ausente)', 'FINANCE.INVALID_STATE');
    if (this.props.reversesId) {
      throw new DomainError('Um estorno não pode ser estornado', 'FINANCE.CANNOT_REVERSE_REVERSAL');
    }
    const reason = input.reason?.trim();
    if (!reason) throw new DomainError('Informe o motivo do estorno', 'FINANCE.REVERSAL_REASON_REQUIRED');

    return FinanceTransaction.create({
      kind: this.props.kind,
      date: input.date,
      amountCents: -this.props.amountCents,
      fundId: this.props.fundId,
      cashAccountId: this.props.cashAccountId,
      categoryId: this.props.categoryId,
      method: this.props.method,
      memberId: this.props.memberId,
      description: `Estorno: ${reason}`,
      transferGroupId: input.transferGroupId ?? null,
      reversesId: this.props.id,
      createdById: input.createdById,
    });
  }

  /** `includeMember` = false oculta o vínculo com o membro (dado sensível, LGPD art. 11). */
  toJSON(options: { includeMember: boolean } = { includeMember: false }) {
    return {
      id: this.props.id,
      kind: this.props.kind,
      date: this.props.date.toISOString().slice(0, 10),
      amountCents: this.props.amountCents,
      description: this.props.description,
      fundId: this.props.fundId,
      fundName: this.props.fundName ?? null,
      cashAccountId: this.props.cashAccountId,
      cashAccountName: this.props.cashAccountName ?? null,
      categoryId: this.props.categoryId,
      categoryName: this.props.categoryName ?? null,
      method: this.props.method,
      memberId: options.includeMember ? this.props.memberId : null,
      memberName: options.includeMember ? (this.props.memberName ?? null) : null,
      hasMember: this.props.memberId !== null,
      documentNumber: this.props.documentNumber,
      transferGroupId: this.props.transferGroupId,
      approvalReference: this.props.approvalReference,
      reversesId: this.props.reversesId,
      reversedById: this.props.reversedById ?? null,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
