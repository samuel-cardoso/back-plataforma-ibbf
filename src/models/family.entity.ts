import { DomainError } from '@/shared/errors';

export type FamilyProps = {
  id: string | null;
  name: string;
  createdAt: Date;
};

export class Family {
  private constructor(private props: FamilyProps) {}

  static create(props: { name: string; now?: Date }): Family {
    const name = props.name?.trim();
    if (!name) throw new DomainError('Nome da família é obrigatório', 'FAMILY.INVALID_NAME');

    return new Family({ id: null, name, createdAt: props.now ?? new Date() });
  }

  static restore(props: FamilyProps): Family {
    if (!props.id) throw new DomainError('Família inválida (id ausente)', 'FAMILY.INVALID_STATE');
    return new Family({ ...props });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get createdAt() { return this.props.createdAt; }

  update(patch: { name?: string }) {
    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (!name) throw new DomainError('Nome da família é obrigatório', 'FAMILY.INVALID_NAME');
      this.props.name = name;
    }
  }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
