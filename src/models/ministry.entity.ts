import { DomainError } from '@/shared/errors';

export type MinistryProps = {
  id: string | null;
  name: string;
  leaderId: string | null;
  description: string | null;
};

export class Ministry {
  private constructor(private props: MinistryProps) {}

  static create(props: { name: string; leaderId?: string | null; description?: string | null }): Ministry {
    const name = props.name?.trim();
    if (!name) throw new DomainError('Nome do ministério é obrigatório', 'MINISTRY.INVALID_NAME');

    return new Ministry({
      id: null,
      name,
      leaderId: props.leaderId ?? null,
      description: props.description?.trim() || null,
    });
  }

  static restore(props: MinistryProps): Ministry {
    if (!props.id) throw new DomainError('Ministério inválido (id ausente)', 'MINISTRY.INVALID_STATE');
    return new Ministry({ ...props });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get leaderId() { return this.props.leaderId; }
  get description() { return this.props.description; }

  update(patch: { name?: string; leaderId?: string | null; description?: string | null }) {
    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (!name) throw new DomainError('Nome do ministério é obrigatório', 'MINISTRY.INVALID_NAME');
      this.props.name = name;
    }
    if (patch.leaderId !== undefined) this.props.leaderId = patch.leaderId;
    if (patch.description !== undefined) this.props.description = patch.description?.trim() || null;
  }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      leaderId: this.props.leaderId,
      description: this.props.description,
    };
  }
}
