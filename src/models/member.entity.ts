import { DomainError } from '@/shared/errors';

export type MemberType = 'MEMBER' | 'CONGREGANT' | 'VISITOR';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';

export type MemberProps = {
  id: string | null;
  userId: string | null;
  familyId: string | null;
  fullName: string;
  cpf: string | null;
  birthDate: Date;
  phone: string | null;
  address: string | null;
  memberType: MemberType;
  memberStatus: MemberStatus;
  joinedAt: Date;
  baptized: boolean;
};

export class Member {
  private constructor(private props: MemberProps) {}

  static create(props: {
    fullName: string;
    cpf?: string | null;
    birthDate: Date;
    phone?: string | null;
    address?: string | null;
    memberType: MemberType;
    memberStatus?: MemberStatus;
    joinedAt?: Date;
    baptized?: boolean;
    userId?: string | null;
    familyId?: string | null;
    now?: Date;
  }): Member {
    const fullName = props.fullName?.trim();
    if (!fullName) {
      throw new DomainError('Nome completo é obrigatório', 'MEMBER.INVALID_FULL_NAME');
    }

    if (!props.birthDate || Number.isNaN(props.birthDate.getTime())) {
      throw new DomainError('Data de nascimento inválida', 'MEMBER.INVALID_BIRTH_DATE');
    }

    return new Member({
      id: null,
      userId: props.userId ?? null,
      familyId: props.familyId ?? null,
      fullName,
      cpf: Member.normalizeCpf(props.cpf),
      birthDate: props.birthDate,
      phone: props.phone?.trim() || null,
      address: props.address?.trim() || null,
      memberType: props.memberType,
      memberStatus: props.memberStatus ?? 'ACTIVE',
      joinedAt: props.joinedAt ?? props.now ?? new Date(),
      baptized: props.baptized ?? false,
    });
  }

  static restore(props: MemberProps): Member {
    if (!props.id) throw new DomainError('Membro inválido (id ausente)', 'MEMBER.INVALID_STATE');
    return new Member({ ...props });
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get familyId() { return this.props.familyId; }
  get fullName() { return this.props.fullName; }
  get cpf() { return this.props.cpf; }
  get birthDate() { return this.props.birthDate; }
  get phone() { return this.props.phone; }
  get address() { return this.props.address; }
  get memberType() { return this.props.memberType; }
  get memberStatus() { return this.props.memberStatus; }
  get joinedAt() { return this.props.joinedAt; }
  get baptized() { return this.props.baptized; }

  update(patch: {
    fullName?: string;
    cpf?: string | null;
    birthDate?: Date;
    phone?: string | null;
    address?: string | null;
    memberType?: MemberType;
    memberStatus?: MemberStatus;
    joinedAt?: Date;
    baptized?: boolean;
    familyId?: string | null;
    userId?: string | null;
  }) {
    if (patch.fullName !== undefined) {
      const fullName = patch.fullName.trim();
      if (!fullName) throw new DomainError('Nome completo é obrigatório', 'MEMBER.INVALID_FULL_NAME');
      this.props.fullName = fullName;
    }

    if (patch.cpf !== undefined) {
      this.props.cpf = Member.normalizeCpf(patch.cpf);
    }

    if (patch.birthDate !== undefined) {
      if (Number.isNaN(patch.birthDate.getTime())) {
        throw new DomainError('Data de nascimento inválida', 'MEMBER.INVALID_BIRTH_DATE');
      }
      this.props.birthDate = patch.birthDate;
    }

    if (patch.phone !== undefined) this.props.phone = patch.phone?.trim() || null;
    if (patch.address !== undefined) this.props.address = patch.address?.trim() || null;
    if (patch.memberType !== undefined) this.props.memberType = patch.memberType;
    if (patch.memberStatus !== undefined) this.props.memberStatus = patch.memberStatus;
    if (patch.joinedAt !== undefined) this.props.joinedAt = patch.joinedAt;
    if (patch.baptized !== undefined) this.props.baptized = patch.baptized;
    if (patch.familyId !== undefined) this.props.familyId = patch.familyId;
    if (patch.userId !== undefined) this.props.userId = patch.userId;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      familyId: this.props.familyId,
      fullName: this.props.fullName,
      cpf: this.props.cpf,
      birthDate: this.props.birthDate.toISOString().slice(0, 10),
      phone: this.props.phone,
      address: this.props.address,
      memberType: this.props.memberType,
      memberStatus: this.props.memberStatus,
      joinedAt: this.props.joinedAt.toISOString().slice(0, 10),
      baptized: this.props.baptized,
    };
  }

  /** Mantém só dígitos e exige 11 (não valida dígito verificador — fora de escopo por ora). */
  private static normalizeCpf(cpf?: string | null): string | null {
    if (!cpf || !cpf.trim()) return null;
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) {
      throw new DomainError('CPF inválido', 'MEMBER.INVALID_CPF');
    }
    return digits;
  }
}
