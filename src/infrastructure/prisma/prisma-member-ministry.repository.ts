import { Prisma } from '@prisma/client';
import { MemberMinistry, MemberMinistryProps } from '@/models';
import { MemberMinistryRepositoryPort } from '@/repositories';
import { DomainError } from '@/shared/errors';
import { PrismaService } from './prisma.service';

type MemberMinistryRow = {
  id: string;
  memberId: string;
  ministryId: string;
  role: MemberMinistryProps['role'];
  joinedAt: Date;
  member?: { fullName: string };
};

export class PrismaMemberMinistryRepository implements MemberMinistryRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(memberMinistry: MemberMinistry): Promise<MemberMinistry> {
    try {
      const created = await this.dependencies.prismaService.client.memberMinistry.create({
        data: {
          memberId: memberMinistry.memberId,
          ministryId: memberMinistry.ministryId,
          role: memberMinistry.role,
          joinedAt: memberMinistry.joinedAt,
        },
      });
      return this.toEntity(created);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findByMemberAndMinistry(memberId: string, ministryId: string): Promise<MemberMinistry | null> {
    const found = await this.dependencies.prismaService.client.memberMinistry.findUnique({
      where: { memberId_ministryId: { memberId, ministryId } },
    });
    return found ? this.toEntity(found) : null;
  }

  async findManyByMinistry(
    ministryId: string,
    pagination: { page: number; limit: number }
  ): Promise<{ data: MemberMinistry[]; total: number }> {
    const where: Prisma.MemberMinistryWhereInput = { ministryId };
    const skip = (pagination.page - 1) * pagination.limit;

    const [rows, total] = await Promise.all([
      this.dependencies.prismaService.client.memberMinistry.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { joinedAt: 'asc' },
        include: { member: { select: { fullName: true } } },
      }),
      this.dependencies.prismaService.client.memberMinistry.count({ where }),
    ]);

    return { data: rows.map((row) => this.toEntity(row)), total };
  }

  async update(memberMinistry: MemberMinistry): Promise<MemberMinistry> {
    const updated = await this.dependencies.prismaService.client.memberMinistry.update({
      where: { id: memberMinistry.id as string },
      data: { role: memberMinistry.role },
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.dependencies.prismaService.client.memberMinistry.delete({ where: { id } });
  }

  private translateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new DomainError('Membro já participa deste ministério', 'MEMBER_MINISTRY.ALREADY_PARTICIPATING');
      }
      if (error.code === 'P2003') {
        return new DomainError('Membro ou ministério informado não existe', 'MEMBER_MINISTRY.INVALID_REFERENCE');
      }
    }
    return error;
  }

  private toEntity(row: MemberMinistryRow): MemberMinistry {
    return MemberMinistry.restore({
      id: row.id,
      memberId: row.memberId,
      ministryId: row.ministryId,
      memberName: row.member?.fullName,
      role: row.role,
      joinedAt: row.joinedAt,
    });
  }
}
