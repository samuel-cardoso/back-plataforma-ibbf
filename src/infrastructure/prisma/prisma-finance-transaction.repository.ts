import { Prisma } from '@prisma/client';
import { FinanceTransaction, FinanceTransactionProps } from '@/models';
import {
  FinanceBalances,
  FinancePeriodSummary,
  FinanceTransactionListFilters,
  FinanceTransactionRepositoryPort,
} from '@/repositories';
import { DomainError } from '@/shared/errors';
import { PrismaService } from './prisma.service';

const LIST_INCLUDE = {
  fund: { select: { name: true } },
  cashAccount: { select: { name: true } },
  category: { select: { name: true } },
  member: { select: { fullName: true } },
  reversedBy: { select: { id: true } },
} satisfies Prisma.FinanceTransactionInclude;

type TransactionRow = Omit<FinanceTransactionProps, 'fundName' | 'cashAccountName' | 'categoryName' | 'memberName' | 'reversedById'>;
type TransactionRowWithJoins = Prisma.FinanceTransactionGetPayload<{ include: typeof LIST_INCLUDE }>;

export class PrismaFinanceTransactionRepository implements FinanceTransactionRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async createMany(transactions: FinanceTransaction[]): Promise<FinanceTransaction[]> {
    try {
      const client = this.dependencies.prismaService.client;
      const created = await client.$transaction(
        transactions.map((transaction) => client.financeTransaction.create({ data: this.toData(transaction) }))
      );
      return created.map((row) => this.toEntity(row));
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findById(id: string): Promise<FinanceTransaction | null> {
    const found = await this.dependencies.prismaService.client.financeTransaction.findUnique({
      where: { id },
      include: LIST_INCLUDE,
    });
    return found ? this.toEntityWithJoins(found) : null;
  }

  async findByTransferGroup(transferGroupId: string): Promise<FinanceTransaction[]> {
    const rows = await this.dependencies.prismaService.client.financeTransaction.findMany({
      where: { transferGroupId },
      orderBy: { amountCents: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async isReversed(id: string): Promise<boolean> {
    const count = await this.dependencies.prismaService.client.financeTransaction.count({ where: { reversesId: id } });
    return count > 0;
  }

  async findMany(
    filters: FinanceTransactionListFilters,
    pagination: { page: number; limit: number }
  ): Promise<{ data: FinanceTransaction[]; total: number }> {
    const where: Prisma.FinanceTransactionWhereInput = {};
    if (filters.from || filters.to) where.date = { gte: filters.from, lte: filters.to };
    if (filters.fundId) where.fundId = filters.fundId;
    if (filters.cashAccountId) where.cashAccountId = filters.cashAccountId;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.kind) where.kind = filters.kind;
    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { documentNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [rows, total] = await Promise.all([
      this.dependencies.prismaService.client.financeTransaction.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: LIST_INCLUDE,
      }),
      this.dependencies.prismaService.client.financeTransaction.count({ where }),
    ]);

    return { data: rows.map((row) => this.toEntityWithJoins(row)), total };
  }

  async getFundBalance(fundId: string): Promise<number> {
    const result = await this.dependencies.prismaService.client.financeTransaction.aggregate({
      where: { fundId },
      _sum: { amountCents: true },
    });
    return result._sum.amountCents ?? 0;
  }

  async getBalances(): Promise<FinanceBalances> {
    const client = this.dependencies.prismaService.client;
    const [byFund, byAccount] = await Promise.all([
      client.financeTransaction.groupBy({ by: ['fundId'], _sum: { amountCents: true } }),
      client.financeTransaction.groupBy({ by: ['cashAccountId'], _sum: { amountCents: true } }),
    ]);
    return {
      byFund: byFund.map((row) => ({ fundId: row.fundId, balanceCents: row._sum.amountCents ?? 0 })),
      byAccount: byAccount.map((row) => ({ cashAccountId: row.cashAccountId, balanceCents: row._sum.amountCents ?? 0 })),
    };
  }

  async getSummary(range: { from: Date; to: Date }): Promise<FinancePeriodSummary> {
    const client = this.dependencies.prismaService.client;
    const date = { gte: range.from, lte: range.to };
    const [incomeByFund, incomeByCategory, expenseByCategory] = await Promise.all([
      client.financeTransaction.groupBy({ by: ['fundId'], where: { kind: 'INCOME', date }, _sum: { amountCents: true } }),
      client.financeTransaction.groupBy({ by: ['categoryId'], where: { kind: 'INCOME', date }, _sum: { amountCents: true } }),
      client.financeTransaction.groupBy({ by: ['categoryId'], where: { kind: 'EXPENSE', date }, _sum: { amountCents: true } }),
    ]);

    return {
      incomeByFund: incomeByFund.map((row) => ({ fundId: row.fundId, amountCents: row._sum.amountCents ?? 0 })),
      incomeByCategory: incomeByCategory
        .filter((row) => row.categoryId)
        .map((row) => ({ categoryId: row.categoryId as string, amountCents: row._sum.amountCents ?? 0 })),
      // Despesas são gravadas negativas; o resumo devolve o valor gasto como positivo.
      expenseByCategory: expenseByCategory
        .filter((row) => row.categoryId)
        .map((row) => ({ categoryId: row.categoryId as string, amountCents: -(row._sum.amountCents ?? 0) })),
    };
  }

  private toData(transaction: FinanceTransaction) {
    return {
      kind: transaction.kind,
      date: transaction.date,
      amountCents: transaction.amountCents,
      description: transaction.description,
      fundId: transaction.fundId,
      cashAccountId: transaction.cashAccountId,
      categoryId: transaction.categoryId,
      method: transaction.method,
      memberId: transaction.memberId,
      documentNumber: transaction.documentNumber,
      transferGroupId: transaction.transferGroupId,
      approvalReference: transaction.approvalReference,
      reversesId: transaction.reversesId,
      createdById: transaction.createdById,
    };
  }

  private translateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new DomainError('Este lançamento já foi estornado', 'FINANCE.ALREADY_REVERSED');
      }
      if (error.code === 'P2003') {
        return new DomainError('Fundo, conta, categoria ou membro informado não existe', 'FINANCE.INVALID_REFERENCE');
      }
    }
    return error;
  }

  private toEntity(row: TransactionRow): FinanceTransaction {
    return FinanceTransaction.restore({ ...row });
  }

  private toEntityWithJoins(row: TransactionRowWithJoins): FinanceTransaction {
    const { fund, cashAccount, category, member, reversedBy, ...rest } = row;
    return FinanceTransaction.restore({
      ...rest,
      fundName: fund.name,
      cashAccountName: cashAccount.name,
      categoryName: category?.name ?? null,
      memberName: member?.fullName ?? null,
      reversedById: reversedBy?.id ?? null,
    });
  }
}
