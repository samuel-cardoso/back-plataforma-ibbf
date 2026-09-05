import { DomainError } from '@/shared/errors';

export type MemberMinistryRole = 'LEADER' | 'MEMBER';

export type MemberMinistryProps = {
  id: string | null;
  memberId: string;
  ministryId: string;
  /** Só preenchido quando o repository fez join com Member (leitura). */
  memberName?: string;
  role: MemberMinistryRole;
  joinedAt: Date;
};

/** Resolve a relação N:N entre Member e Ministry (ver ERD "Administração de Membros"). */
export class MemberMinistry {
  private constructor(private props: MemberMinistryProps) {}

  static create(props: {
    memberId: string;
    ministryId: string;
    role?: MemberMinistryRole;
    joinedAt?: Date;
    now?: Date;
  }): MemberMinistry {
    return new MemberMinistry({
      id: null,
      memberId: props.memberId,
      ministryId: props.ministryId,
      role: props.role ?? 'MEMBER',
      joinedAt: props.joinedAt ?? props.now ?? new Date(),
    });
  }

  static restore(props: MemberMinistryProps): MemberMinistry {
    if (!props.id) throw new DomainError('Participação inválida (id ausente)', 'MEMBER_MINISTRY.INVALID_STATE');
    return new MemberMinistry({ ...props });
  }

  get id() { return this.props.id; }
  get memberId() { return this.props.memberId; }
  get ministryId() { return this.props.ministryId; }
  get memberName() { return this.props.memberName; }
  get role() { return this.props.role; }
  get joinedAt() { return this.props.joinedAt; }

  update(patch: { role?: MemberMinistryRole }) {
    if (patch.role !== undefined) this.props.role = patch.role;
  }

  toJSON() {
    return {
      id: this.props.id,
      memberId: this.props.memberId,
      ministryId: this.props.ministryId,
      memberName: this.props.memberName,
      role: this.props.role,
      joinedAt: this.props.joinedAt.toISOString().slice(0, 10),
    };
  }
}
