import { canAccess } from '@samuel-cardoso/ibbf-authz';
import { RoleRepositoryPort, UserFinanceRoleRepositoryPort } from '@/repositories';
import { FINANCE_ROLE_MANAGER_MIN_LEVEL } from '@/shared/constants';
import type { FinanceMeInput } from './finance-me.dto';

interface Dependencies {
  userFinanceRoleRepository: UserFinanceRoleRepositoryPort;
  roleRepository: RoleRepositoryPort;
}

/** O que o usuário logado pode fazer no financeiro — o front usa para montar menu e telas. */
export class FinanceMeUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceMeInput) {
    const [financeRole, role] = await Promise.all([
      this.dependencies.userFinanceRoleRepository.findByUserId(input.userId),
      this.dependencies.roleRepository.findById(input.roleId),
    ]);

    return {
      financeRole: financeRole
        ? { role: financeRole.role, canViewIndividualGiving: financeRole.canViewIndividualGiving }
        : null,
      canManageRoles: canAccess(role, FINANCE_ROLE_MANAGER_MIN_LEVEL),
    };
  }
}
