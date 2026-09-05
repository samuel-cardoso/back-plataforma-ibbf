import { Role } from '@/models';

export interface RoleRepositoryPort {
  findByName(name: string): Promise<Role | null>;
}
