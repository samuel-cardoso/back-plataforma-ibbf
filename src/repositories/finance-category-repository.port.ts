import { FinanceCategory, FinanceCategoryType } from '@/models';

export interface FinanceCategoryRepositoryPort {
  create(category: FinanceCategory): Promise<FinanceCategory>;
  findById(id: string): Promise<FinanceCategory | null>;
  findAll(filters: { type?: FinanceCategoryType; activeOnly?: boolean }): Promise<FinanceCategory[]>;
  update(category: FinanceCategory): Promise<FinanceCategory>;
}
