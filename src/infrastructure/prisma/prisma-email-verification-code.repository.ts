import { EmailVerificationCode } from '@/models';
import { EmailVerificationCodeRepositoryPort } from '@/repositories';
import { PrismaService } from './prisma.service';

type EmailVerificationCodeRow = {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export class PrismaEmailVerificationCodeRepository implements EmailVerificationCodeRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(code: EmailVerificationCode): Promise<EmailVerificationCode> {
    const created = await this.dependencies.prismaService.client.emailVerificationCode.create({
      data: {
        userId: code.userId,
        codeHash: code.codeHash,
        expiresAt: code.expiresAt,
      },
    });
    return this.toEntity(created);
  }

  async findValidByUserAndCodeHash(userId: string, codeHash: string): Promise<EmailVerificationCode | null> {
    const found = await this.dependencies.prismaService.client.emailVerificationCode.findFirst({
      where: { userId, codeHash, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    return found ? this.toEntity(found) : null;
  }

  async update(code: EmailVerificationCode): Promise<EmailVerificationCode> {
    const updated = await this.dependencies.prismaService.client.emailVerificationCode.update({
      where: { id: code.id as string },
      data: { usedAt: code.usedAt },
    });
    return this.toEntity(updated);
  }

  private toEntity(row: EmailVerificationCodeRow): EmailVerificationCode {
    return EmailVerificationCode.restore({ ...row });
  }
}
