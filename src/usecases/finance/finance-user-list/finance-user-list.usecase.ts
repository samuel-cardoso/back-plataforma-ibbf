import { UserFinanceRoleRepositoryPort } from '@/repositories';

interface Dependencies {
  userFinanceRoleRepository: UserFinanceRoleRepositoryPort;
}

export class FinanceUserListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute() {
    const users = await this.dependencies.userFinanceRoleRepository.listUsers();
    return users.map((user) => ({
      userId: user.userId,
      email: user.email,
      roleName: user.roleName,
      memberName: user.memberName,
      financeRole: user.financeRole?.role ?? null,
      canViewIndividualGiving: user.financeRole?.canViewIndividualGiving ?? false,
    }));
  }
}
