import { Prisma } from '@prisma/client';
import { Fund, FundProps } from '@/models';
import { FundRepositoryPort } from '@/repositories';
import { DomainError } from '@/shared/errors';
import { PrismaService } from './prisma.service';

export class PrismaFundRepository implements FundRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(fund: Fund): Promise<Fund> {
    try {
      const created = await this.dependencies.prismaService.client.fund.create({ data: this.toData(fund) });
      return this.toEntity(created);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findById(id: string): Promise<Fund | null> {
    const found = await this.dependencies.prismaService.client.fund.findUnique({ where: { id } });
    return found ? this.toEntity(found) : null;
  }

  async findAll(filters: { activeOnly?: boolean }): Promise<Fund[]> {
    const rows = await this.dependencies.prismaService.client.fund.findMany({
      where: filters.activeOnly ? { active: true } : {},
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async update(fund: Fund): Promise<Fund> {
    try {
      const updated = await this.dependencies.prismaService.client.fund.update({
        where: { id: fund.id as string },
        data: this.toData(fund),
      });
      return this.toEntity(updated);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  private toData(fund: Fund) {
    return {
      name: fund.name,
      restricted: fund.restricted,
      active: fund.active,
      pixTxid: fund.pixTxid,
      sortOrder: fund.sortOrder,
    };
  }

  private translateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new DomainError('Já existe um fundo com este nome ou identificador Pix', 'FUND.ALREADY_EXISTS');
    }
    return error;
  }

  private toEntity(row: FundProps): Fund {
    return Fund.restore({ ...row });
  }
}
