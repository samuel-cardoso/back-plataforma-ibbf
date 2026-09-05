import { Prisma } from '@prisma/client';
import { Ministry } from '@/models';
import { MinistryRepositoryPort } from '@/repositories';
import { DomainError } from '@/shared/errors';
import { PrismaService } from './prisma.service';

type MinistryRow = { id: string; name: string; leaderId: string | null; description: string | null };

export class PrismaMinistryRepository implements MinistryRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(ministry: Ministry): Promise<Ministry> {
    try {
      const created = await this.dependencies.prismaService.client.ministry.create({ data: this.toData(ministry) });
      return this.toEntity(created);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findById(id: string): Promise<Ministry | null> {
    const found = await this.dependencies.prismaService.client.ministry.findUnique({ where: { id } });
    return found ? this.toEntity(found) : null;
  }

  async findMany(
    filters: { search?: string },
    pagination: { page: number; limit: number }
  ): Promise<{ data: Ministry[]; total: number }> {
    const where: Prisma.MinistryWhereInput = {};
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [rows, total] = await Promise.all([
      this.dependencies.prismaService.client.ministry.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
      }),
      this.dependencies.prismaService.client.ministry.count({ where }),
    ]);

    return { data: rows.map((row) => this.toEntity(row)), total };
  }

  async update(ministry: Ministry): Promise<Ministry> {
    try {
      const updated = await this.dependencies.prismaService.client.ministry.update({
        where: { id: ministry.id as string },
        data: this.toData(ministry),
      });
      return this.toEntity(updated);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.dependencies.prismaService.client.ministry.delete({ where: { id } });
  }

  private toData(ministry: Ministry) {
    return { name: ministry.name, leaderId: ministry.leaderId, description: ministry.description };
  }

  private translateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new DomainError('Já existe um ministério com este nome', 'MINISTRY.NAME_ALREADY_EXISTS');
      }
      if (error.code === 'P2003') {
        return new DomainError('Líder informado não existe', 'MINISTRY.INVALID_LEADER');
      }
    }
    return error;
  }

  private toEntity(row: MinistryRow): Ministry {
    return Ministry.restore({ ...row });
  }
}
