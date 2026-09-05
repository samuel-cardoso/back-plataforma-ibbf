import { Ministry } from '@/models';

export interface MinistryRepositoryPort {
  create(ministry: Ministry): Promise<Ministry>;
  findById(id: string): Promise<Ministry | null>;
  findMany(
    filters: { search?: string },
    pagination: { page: number; limit: number }
  ): Promise<{ data: Ministry[]; total: number }>;
  update(ministry: Ministry): Promise<Ministry>;
  delete(id: string): Promise<void>;
}
