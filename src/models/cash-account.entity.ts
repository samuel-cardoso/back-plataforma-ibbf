import { DomainError } from '@/shared/errors';

export type CashAccountKind = 'CASH' | 'BANK';

export type CashAccountProps = {
  id: string | null;
  name: string;
  kind: CashAccountKind;
  bankName: string | null;
  active: boolean;
  createdAt: Date;
};

/** Onde o dinheiro está fisicamente: caixa (espécie) ou conta bancária. O saldo é sempre calculado. */
export class CashAccount {
  private constructor(private props: CashAccountProps) {}

  static create(props: { name: string; kind: CashAccountKind; bankName?: string | null; now?: Date }): CashAccount {
    return new CashAccount({
      id: null,
      name: CashAccount.validateName(props.name),
      kind: props.kind,
      bankName: props.bankName?.trim() || null,
      active: true,
      createdAt: props.now ?? new Date(),
    });
  }

  static restore(props: CashAccountProps): CashAccount {
    if (!props.id) throw new DomainError('Conta inválida (id ausente)', 'CASH_ACCOUNT.INVALID_STATE');
    return new CashAccount({ ...props });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get kind() { return this.props.kind; }
  get bankName() { return this.props.bankName; }
  get active() { return this.props.active; }
  get createdAt() { return this.props.createdAt; }

  update(patch: { name?: string; bankName?: string | null; active?: boolean }) {
    if (patch.name !== undefined) this.props.name = CashAccount.validateName(patch.name);
    if (patch.bankName !== undefined) this.props.bankName = patch.bankName?.trim() || null;
    if (patch.active !== undefined) this.props.active = patch.active;
  }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      kind: this.props.kind,
      bankName: this.props.bankName,
      active: this.props.active,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  private static validateName(name: string): string {
    const trimmed = name?.trim();
    if (!trimmed) throw new DomainError('Nome da conta é obrigatório', 'CASH_ACCOUNT.INVALID_NAME');
    return trimmed;
  }
}
