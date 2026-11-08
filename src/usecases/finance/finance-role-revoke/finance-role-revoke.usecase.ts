import { FinanceAuditLogRepositoryPort, UserFinanceRoleRepositoryPort } from '@/repositories';

interface Dependencies {
  userFinanceRoleRepository: UserFinanceRoleRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class FinanceRoleRevokeUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: { targetUserId: string; userId: string }): Promise<void> {
    const existing = await this.dependencies.userFinanceRoleRepository.findByUserId(input.targetUserId);
    if (!existing) return;

    await this.dependencies.userFinanceRoleRepository.deleteByUserId(input.targetUserId);
    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'REVOKE_ROLE',
      entity: 'UserFinanceRole',
      entityId: input.targetUserId,
      data: { before: existing.toJSON() },
    });
  }
}
