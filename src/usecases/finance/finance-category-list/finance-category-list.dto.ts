import type { FinanceCategoryType } from '@/models';

export interface FinanceCategoryListInput {
  type?: FinanceCategoryType;
  activeOnly?: boolean;
}
