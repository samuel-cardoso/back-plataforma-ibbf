import { Fund } from '@/models';

export interface FundRepositoryPort {
  create(fund: Fund): Promise<Fund>;
  findById(id: string): Promise<Fund | null>;
  findAll(filters: { activeOnly?: boolean }): Promise<Fund[]>;
  update(fund: Fund): Promise<Fund>;
}
