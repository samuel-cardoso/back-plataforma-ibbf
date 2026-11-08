import { UserFinanceRole } from '@/models';
import { FinanceAuditLogRepositoryPort, UserFinanceRoleRepositoryPort, UserRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { FinanceRoleAssignInput } from './finance-role-assign.dto';

interface Dependencies {
  userFinanceRoleRepository: UserFinanceRoleRepositoryPort;
  userRepository: UserRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FinanceRoleAssignUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: FinanceRoleAssignInput): Promise<UserFinanceRole> {
    const target = await this.dependencies.userRepository.findById(input.targetUserId);
    if (!target) throw new NotFoundError('Usuário');

    const existing = await this.dependencies.userFinanceRoleRepository.findByUserId(input.targetUserId);
    const before = existing?.toJSON() ?? null;
    const role = existing ?? UserFinanceRole.create({ userId: input.targetUserId, role: input.role });
    role.update({ role: input.role, canViewIndividualGiving: input.canViewIndividualGiving });

    const saved = await this.dependencies.userFinanceRoleRepository.save(role);
    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'ASSIGN_ROLE',
      entity: 'UserFinanceRole',
      entityId: input.targetUserId,
      data: { before, after: saved.toJSON() },
    });
    return saved;
  }
}
