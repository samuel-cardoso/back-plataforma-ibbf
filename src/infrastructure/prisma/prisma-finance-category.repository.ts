import { Prisma } from '@prisma/client';
import { FinanceCategory, FinanceCategoryProps, FinanceCategoryType } from '@/models';
import { FinanceCategoryRepositoryPort } from '@/repositories';
import { DomainError } from '@/shared/errors';
import { PrismaService } from './prisma.service';

export class PrismaFinanceCategoryRepository implements FinanceCategoryRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(category: FinanceCategory): Promise<FinanceCategory> {
    try {
      const created = await this.dependencies.prismaService.client.financeCategory.create({
        data: this.toData(category),
      });
      return this.toEntity(created);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findById(id: string): Promise<FinanceCategory | null> {
    const found = await this.dependencies.prismaService.client.financeCategory.findUnique({ where: { id } });
    return found ? this.toEntity(found) : null;
  }

  async findAll(filters: { type?: FinanceCategoryType; activeOnly?: boolean }): Promise<FinanceCategory[]> {
    const where: Prisma.FinanceCategoryWhereInput = {};
    if (filters.type) where.type = filters.type;
    if (filters.activeOnly) where.active = true;
    const rows = await this.dependencies.prismaService.client.financeCategory.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async update(category: FinanceCategory): Promise<FinanceCategory> {
    try {
      const updated = await this.dependencies.prismaService.client.financeCategory.update({
        where: { id: category.id as string },
        data: this.toData(category),
      });
      return this.toEntity(updated);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  private toData(category: FinanceCategory) {
    return {
      name: category.name,
      type: category.type,
      parentId: category.parentId,
      accountingCode: category.accountingCode,
      active: category.active,
    };
  }

  private translateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new DomainError('Já existe uma categoria com este nome', 'FINANCE_CATEGORY.ALREADY_EXISTS');
      }
      if (error.code === 'P2003') {
        return new DomainError('Categoria-pai informada não existe', 'FINANCE_CATEGORY.INVALID_PARENT');
      }
    }
    return error;
  }

  private toEntity(row: FinanceCategoryProps): FinanceCategory {
    return FinanceCategory.restore({ ...row });
  }
}
