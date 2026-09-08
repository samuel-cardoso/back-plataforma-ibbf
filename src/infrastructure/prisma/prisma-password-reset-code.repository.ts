import { PasswordResetCode } from '@/models';
import { PasswordResetCodeRepositoryPort } from '@/repositories';
import { PrismaService } from './prisma.service';

type PasswordResetCodeRow = {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export class PrismaPasswordResetCodeRepository implements PasswordResetCodeRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(code: PasswordResetCode): Promise<PasswordResetCode> {
    const created = await this.dependencies.prismaService.client.passwordResetCode.create({
      data: {
        userId: code.userId,
        codeHash: code.codeHash,
        expiresAt: code.expiresAt,
      },
    });
    return this.toEntity(created);
  }

  async findValidByUserAndCodeHash(userId: string, codeHash: string): Promise<PasswordResetCode | null> {
    const found = await this.dependencies.prismaService.client.passwordResetCode.findFirst({
      where: { userId, codeHash, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    return found ? this.toEntity(found) : null;
  }

  async update(code: PasswordResetCode): Promise<PasswordResetCode> {
    const updated = await this.dependencies.prismaService.client.passwordResetCode.update({
      where: { id: code.id as string },
      data: { usedAt: code.usedAt },
    });
    return this.toEntity(updated);
  }

  private toEntity(row: PasswordResetCodeRow): PasswordResetCode {
    return PasswordResetCode.restore({ ...row });
  }
}
