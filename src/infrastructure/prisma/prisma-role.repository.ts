import { Role } from '@/models';
import { RoleRepositoryPort } from '@/repositories';
import { PrismaService } from './prisma.service';

export class PrismaRoleRepository implements RoleRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async findByName(name: string): Promise<Role | null> {
    const found = await this.dependencies.prismaService.client.role.findUnique({ where: { name } });
    return found ? Role.restore(found) : null;
  }

  async findById(id: string): Promise<Role | null> {
    const found = await this.dependencies.prismaService.client.role.findUnique({ where: { id } });
    return found ? Role.restore(found) : null;
  }
}
