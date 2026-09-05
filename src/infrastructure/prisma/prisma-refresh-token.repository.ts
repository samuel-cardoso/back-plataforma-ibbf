import { RefreshToken } from '@/models';
import { RefreshTokenRepositoryPort } from '@/repositories';
import { PrismaService } from './prisma.service';

type RefreshTokenRow = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
};

export class PrismaRefreshTokenRepository implements RefreshTokenRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const created = await this.dependencies.prismaService.client.refreshToken.create({
      data: {
        userId: refreshToken.userId,
        tokenHash: refreshToken.tokenHash,
        expiresAt: refreshToken.expiresAt,
        userAgent: refreshToken.userAgent,
      },
    });
    return this.toEntity(created);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const found = await this.dependencies.prismaService.client.refreshToken.findUnique({ where: { tokenHash } });
    return found ? this.toEntity(found) : null;
  }

  async update(refreshToken: RefreshToken): Promise<RefreshToken> {
    const updated = await this.dependencies.prismaService.client.refreshToken.update({
      where: { id: refreshToken.id as string },
      data: { revokedAt: refreshToken.revokedAt },
    });
    return this.toEntity(updated);
  }

  private toEntity(row: RefreshTokenRow): RefreshToken {
    return RefreshToken.restore({ ...row });
  }
}
