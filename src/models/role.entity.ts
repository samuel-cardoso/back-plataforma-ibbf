export type RoleProps = {
  id: string;
  name: string;
  level: number;
  description: string | null;
};

export class Role {
  private constructor(private props: RoleProps) {}

  static restore(props: RoleProps): Role {
    return new Role({ ...props });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get level() { return this.props.level; }
  get description() { return this.props.description; }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      level: this.props.level,
      description: this.props.description,
    };
  }
}
