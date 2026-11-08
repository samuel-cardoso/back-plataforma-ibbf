import { DomainError } from '@/shared/errors';

/**
 * Papéis financeiros, independentes do `Role.level` (segregação de funções):
 * - TREASURER: lança, confirma, fecha o mês.
 * - FISCAL_COUNCIL: leitura completa para exame de contas, sem escrita.
 * - PASTOR_VIEWER: painel e relatórios agregados.
 * - COUNTER: só a contagem de culto em que está escalado.
 */
export type FinanceRoleName = 'TREASURER' | 'FISCAL_COUNCIL' | 'PASTOR_VIEWER' | 'COUNTER';

export type UserFinanceRoleProps = {
  id: string | null;
  userId: string;
  role: FinanceRoleName;
  canViewIndividualGiving: boolean;
};

export class UserFinanceRole {
  private constructor(private props: UserFinanceRoleProps) {}

  static create(props: { userId: string; role: FinanceRoleName; canViewIndividualGiving?: boolean }): UserFinanceRole {
    return new UserFinanceRole({
      id: null,
      userId: props.userId,
      role: props.role,
      canViewIndividualGiving: props.canViewIndividualGiving ?? false,
    });
  }

  static restore(props: UserFinanceRoleProps): UserFinanceRole {
    if (!props.id) throw new DomainError('Papel financeiro inválido (id ausente)', 'FINANCE_ROLE.INVALID_STATE');
    return new UserFinanceRole({ ...props });
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get role() { return this.props.role; }
  get canViewIndividualGiving() { return this.props.canViewIndividualGiving; }

  update(patch: { role?: FinanceRoleName; canViewIndividualGiving?: boolean }) {
    if (patch.role !== undefined) this.props.role = patch.role;
    if (patch.canViewIndividualGiving !== undefined) this.props.canViewIndividualGiving = patch.canViewIndividualGiving;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      role: this.props.role,
      canViewIndividualGiving: this.props.canViewIndividualGiving,
    };
  }
}
