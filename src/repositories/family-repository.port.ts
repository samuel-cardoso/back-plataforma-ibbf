import { Family } from '@/models';

export interface FamilyRepositoryPort {
  create(family: Family): Promise<Family>;
  findById(id: string): Promise<Family | null>;
  findMany(
    filters: { search?: string },
    pagination: { page: number; limit: number }
  ): Promise<{ data: Family[]; total: number }>;
  update(family: Family): Promise<Family>;
  delete(id: string): Promise<void>;
}
