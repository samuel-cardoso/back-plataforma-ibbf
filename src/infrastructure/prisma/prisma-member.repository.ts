import { Prisma } from '@prisma/client';
import { Member, MemberProps } from '@/models';
import { MemberListFilters, MemberRepositoryPort } from '@/repositories';
import { DomainError } from '@/shared/errors';
import { PrismaService } from './prisma.service';

type MemberRow = {
  id: string;
  userId: string | null;
  familyId: string | null;
  fullName: string;
  cpf: string | null;
  birthDate: Date;
  phone: string | null;
  address: string | null;
  memberType: MemberProps['memberType'];
  memberStatus: MemberProps['memberStatus'];
  joinedAt: Date;
  baptized: boolean;
};

export class PrismaMemberRepository implements MemberRepositoryPort {
  constructor(private readonly dependencies: { prismaService: PrismaService }) {}

  async create(member: Member): Promise<Member> {
    try {
      const created = await this.dependencies.prismaService.client.member.create({ data: this.toData(member) });
      return this.toEntity(created);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findById(id: string): Promise<Member | null> {
    const found = await this.dependencies.prismaService.client.member.findUnique({ where: { id } });
    return found ? this.toEntity(found) : null;
  }

  async findByCpf(cpf: string): Promise<Member | null> {
    const found = await this.dependencies.prismaService.client.member.findUnique({ where: { cpf } });
    return found ? this.toEntity(found) : null;
  }

  async findMany(
    filters: MemberListFilters,
    pagination: { page: number; limit: number }
  ): Promise<{ data: Member[]; total: number }> {
    const where: Prisma.MemberWhereInput = {};
    if (filters.search) {
      where.fullName = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.memberType) where.memberType = filters.memberType;
    if (filters.memberStatus) where.memberStatus = filters.memberStatus;
    if (filters.familyId) where.familyId = filters.familyId;

    const skip = (pagination.page - 1) * pagination.limit;
    const [rows, total] = await Promise.all([
      this.dependencies.prismaService.client.member.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { fullName: 'asc' },
      }),
      this.dependencies.prismaService.client.member.count({ where }),
    ]);

    return { data: rows.map((row) => this.toEntity(row)), total };
  }

  async update(member: Member): Promise<Member> {
    try {
      const updated = await this.dependencies.prismaService.client.member.update({
        where: { id: member.id as string },
        data: this.toData(member),
      });
      return this.toEntity(updated);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.dependencies.prismaService.client.member.delete({ where: { id } });
  }

  private toData(member: Member) {
    return {
      userId: member.userId,
      familyId: member.familyId,
      fullName: member.fullName,
      cpf: member.cpf,
      birthDate: member.birthDate,
      phone: member.phone,
      address: member.address,
      memberType: member.memberType,
      memberStatus: member.memberStatus,
      joinedAt: member.joinedAt,
      baptized: member.baptized,
    };
  }

  /** Traduz violações conhecidas do Postgres (via Prisma) em erros de domínio. */
  private translateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new DomainError('CPF já cadastrado para outro membro', 'MEMBER.CPF_ALREADY_EXISTS');
      }
      if (error.code === 'P2003') {
        return new DomainError('Família ou usuário informado não existe', 'MEMBER.INVALID_REFERENCE');
      }
    }
    return error;
  }

  private toEntity(row: MemberRow): Member {
    return Member.restore({ ...row });
  }
}
