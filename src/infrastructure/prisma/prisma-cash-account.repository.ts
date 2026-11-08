import { Prisma } from '@prisma/client';
import { CashAccount, CashAccountProps } from '@/models';
import { CashAccountRepositoryPort } from '@/repositories';
import { DomainError } from '@/shared/errors';
import { PrismaService } from './prisma.service';

export class PrismaCashAccountRepository implements CashAccountRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(account: CashAccount): Promise<CashAccount> {
    try {
      const created = await this.dependencies.prismaService.client.cashAccount.create({ data: this.toData(account) });
      return this.toEntity(created);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findById(id: string): Promise<CashAccount | null> {
    const found = await this.dependencies.prismaService.client.cashAccount.findUnique({ where: { id } });
    return found ? this.toEntity(found) : null;
  }

  async findAll(filters: { activeOnly?: boolean }): Promise<CashAccount[]> {
    const rows = await this.dependencies.prismaService.client.cashAccount.findMany({
      where: filters.activeOnly ? { active: true } : {},
      orderBy: [{ kind: 'asc' }, { name: 'asc' }],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async update(account: CashAccount): Promise<CashAccount> {
    try {
      const updated = await this.dependencies.prismaService.client.cashAccount.update({
        where: { id: account.id as string },
        data: this.toData(account),
      });
      return this.toEntity(updated);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  private toData(account: CashAccount) {
    return { name: account.name, kind: account.kind, bankName: account.bankName, active: account.active };
  }

  private translateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new DomainError('Já existe uma conta com este nome', 'CASH_ACCOUNT.ALREADY_EXISTS');
    }
    return error;
  }

  private toEntity(row: CashAccountProps): CashAccount {
    return CashAccount.restore({ ...row });
  }
}
