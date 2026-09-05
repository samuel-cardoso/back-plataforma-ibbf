import { Role } from '@/models';

export interface RoleRepositoryPort {
  findByName(name: string): Promise<Role | null>;
  findById(id: string): Promise<Role | null>;
}
