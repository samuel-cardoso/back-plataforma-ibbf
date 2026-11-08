import { DomainError } from '@/shared/errors';

export type FinanceCategoryType = 'INCOME' | 'EXPENSE';

export type FinanceCategoryProps = {
  id: string | null;
  name: string;
  type: FinanceCategoryType;
  parentId: string | null;
  accountingCode: string | null;
  active: boolean;
  createdAt: Date;
};

/** Conta do plano de contas (receita ou despesa), opcionalmente agrupada sob uma conta-pai. */
export class FinanceCategory {
  private constructor(private props: FinanceCategoryProps) {}

  static create(props: {
    name: string;
    type: FinanceCategoryType;
    parentId?: string | null;
    accountingCode?: string | null;
    now?: Date;
  }): FinanceCategory {
    return new FinanceCategory({
      id: null,
      name: FinanceCategory.validateName(props.name),
      type: props.type,
      parentId: props.parentId ?? null,
      accountingCode: props.accountingCode?.trim() || null,
      active: true,
      createdAt: props.now ?? new Date(),
    });
  }

  static restore(props: FinanceCategoryProps): FinanceCategory {
    if (!props.id) throw new DomainError('Categoria inválida (id ausente)', 'FINANCE_CATEGORY.INVALID_STATE');
    return new FinanceCategory({ ...props });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get type() { return this.props.type; }
  get parentId() { return this.props.parentId; }
  get accountingCode() { return this.props.accountingCode; }
  get active() { return this.props.active; }
  get createdAt() { return this.props.createdAt; }

  update(patch: { name?: string; parentId?: string | null; accountingCode?: string | null; active?: boolean }) {
    if (patch.name !== undefined) this.props.name = FinanceCategory.validateName(patch.name);
    if (patch.parentId !== undefined) {
      if (patch.parentId && patch.parentId === this.props.id) {
        throw new DomainError('Uma categoria não pode ser pai de si mesma', 'FINANCE_CATEGORY.INVALID_PARENT');
      }
      this.props.parentId = patch.parentId;
    }
    if (patch.accountingCode !== undefined) this.props.accountingCode = patch.accountingCode?.trim() || null;
    if (patch.active !== undefined) this.props.active = patch.active;
  }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      type: this.props.type,
      parentId: this.props.parentId,
      accountingCode: this.props.accountingCode,
      active: this.props.active,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  private static validateName(name: string): string {
    const trimmed = name?.trim();
    if (!trimmed) throw new DomainError('Nome da categoria é obrigatório', 'FINANCE_CATEGORY.INVALID_NAME');
    return trimmed;
  }
}
