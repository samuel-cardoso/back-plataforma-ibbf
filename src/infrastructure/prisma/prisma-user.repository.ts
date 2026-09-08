import { User, UserProps } from '@/models';
import { UserRepositoryPort } from '@/repositories';
import { PrismaService } from './prisma.service';

export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(user: User): Promise<User> {
    const created = await this.dependencies.prismaService.client.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        roleId: user.roleId,
        status: user.status,
      },
    });

    return this.toEntity(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.dependencies.prismaService.client.user.findUnique({ where: { email } });
    return found ? this.toEntity(found) : null;
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.dependencies.prismaService.client.user.findUnique({ where: { id } });
    return found ? this.toEntity(found) : null;
  }

  async updateLastLogin(id: string, when: Date): Promise<void> {
    await this.dependencies.prismaService.client.user.update({ where: { id }, data: { lastLoginAt: when } });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.dependencies.prismaService.client.user.update({ where: { id }, data: { passwordHash } });
  }

  /** Converte a linha crua do Prisma para a entidade de domínio. */
  private toEntity(row: {
    id: string;
    email: string;
    passwordHash: string;
    roleId: string;
    status: UserProps['status'];
    lastLoginAt: Date | null;
    createdAt: Date;
  }): User {
    return User.restore({ ...row });
  }
}
