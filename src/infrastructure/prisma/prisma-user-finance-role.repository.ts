import { UserFinanceRole, UserFinanceRoleProps } from '@/models';
import { FinanceUserListItem, UserFinanceRoleRepositoryPort } from '@/repositories';
import { PrismaService } from './prisma.service';

export class PrismaUserFinanceRoleRepository implements UserFinanceRoleRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async findByUserId(userId: string): Promise<UserFinanceRole | null> {
    const found = await this.dependencies.prismaService.client.userFinanceRole.findUnique({ where: { userId } });
    return found ? this.toEntity(found) : null;
  }

  async save(role: UserFinanceRole): Promise<UserFinanceRole> {
    const data = { role: role.role, canViewIndividualGiving: role.canViewIndividualGiving };
    const saved = await this.dependencies.prismaService.client.userFinanceRole.upsert({
      where: { userId: role.userId },
      create: { userId: role.userId, ...data },
      update: data,
    });
    return this.toEntity(saved);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.dependencies.prismaService.client.userFinanceRole.deleteMany({ where: { userId } });
  }

  async listUsers(): Promise<FinanceUserListItem[]> {
    const users = await this.dependencies.prismaService.client.user.findMany({
      orderBy: { email: 'asc' },
      select: {
        id: true,
        email: true,
        role: { select: { name: true } },
        member: { select: { fullName: true } },
        financeRole: true,
      },
    });

    return users.map((user) => ({
      userId: user.id,
      email: user.email,
      roleName: user.role.name,
      memberName: user.member?.fullName ?? null,
      financeRole: user.financeRole ? this.toEntity(user.financeRole) : null,
    }));
  }

  private toEntity(row: UserFinanceRoleProps): UserFinanceRole {
    return UserFinanceRole.restore({
      id: row.id,
      userId: row.userId,
      role: row.role,
      canViewIndividualGiving: row.canViewIndividualGiving,
    });
  }
}
