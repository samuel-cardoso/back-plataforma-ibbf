import { FinancePeriod, FinancePeriodProps } from '@/models';
import { FinancePeriodRepositoryPort } from '@/repositories';
import { PrismaService } from './prisma.service';

export class PrismaFinancePeriodRepository implements FinancePeriodRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async find(year: number, month: number): Promise<FinancePeriod> {
    const found = await this.dependencies.prismaService.client.financePeriod.findUnique({
      where: { year_month: { year, month } },
    });
    return found ? this.toEntity(found) : FinancePeriod.open(year, month);
  }

  async save(period: FinancePeriod): Promise<FinancePeriod> {
    const data = {
      status: period.status,
      closedById: period.closedById,
      closedAt: period.closedAt,
      reopenReason: period.reopenReason,
    };
    const saved = await this.dependencies.prismaService.client.financePeriod.upsert({
      where: { year_month: { year: period.year, month: period.month } },
      create: { year: period.year, month: period.month, ...data },
      update: data,
    });
    return this.toEntity(saved);
  }

  async findClosedInYear(year: number): Promise<FinancePeriod[]> {
    const rows = await this.dependencies.prismaService.client.financePeriod.findMany({
      where: { year, status: 'CLOSED' },
      orderBy: { month: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: FinancePeriodProps): FinancePeriod {
    return FinancePeriod.restore({ ...row });
  }
}
