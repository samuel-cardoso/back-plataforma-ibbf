import { Prisma } from '@prisma/client';
import { Family } from '@/models';
import { FamilyRepositoryPort } from '@/repositories';
import { PrismaService } from './prisma.service';

type FamilyRow = { id: string; name: string; createdAt: Date };

export class PrismaFamilyRepository implements FamilyRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(family: Family): Promise<Family> {
    const created = await this.dependencies.prismaService.client.family.create({
      data: { name: family.name },
    });
    return this.toEntity(created);
  }

  async findById(id: string): Promise<Family | null> {
    const found = await this.dependencies.prismaService.client.family.findUnique({ where: { id } });
    return found ? this.toEntity(found) : null;
  }

  async findMany(
    filters: { search?: string },
    pagination: { page: number; limit: number }
  ): Promise<{ data: Family[]; total: number }> {
    const where: Prisma.FamilyWhereInput = {};
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [rows, total] = await Promise.all([
      this.dependencies.prismaService.client.family.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
      }),
      this.dependencies.prismaService.client.family.count({ where }),
    ]);

    return { data: rows.map((row) => this.toEntity(row)), total };
  }

  async update(family: Family): Promise<Family> {
    const updated = await this.dependencies.prismaService.client.family.update({
      where: { id: family.id as string },
      data: { name: family.name },
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.dependencies.prismaService.client.family.delete({ where: { id } });
  }

  private toEntity(row: FamilyRow): Family {
    return Family.restore({ ...row });
  }
}
