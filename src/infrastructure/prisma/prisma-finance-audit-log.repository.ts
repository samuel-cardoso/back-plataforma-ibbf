import { Prisma } from '@prisma/client';
import { FinanceAuditEntry, FinanceAuditLogRepositoryPort } from '@/repositories';
import { PrismaService } from './prisma.service';

export class PrismaFinanceAuditLogRepository implements FinanceAuditLogRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async record(entry: FinanceAuditEntry): Promise<void> {
    await this.dependencies.prismaService.client.financeAuditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        data: entry.data === undefined ? Prisma.JsonNull : (entry.data as Prisma.InputJsonValue),
      },
    });
  }
}
