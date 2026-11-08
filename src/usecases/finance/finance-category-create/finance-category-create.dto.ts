import type { FinanceCategoryType } from '@/models';

export interface FinanceCategoryCreateInput {
  name: string;
  type: FinanceCategoryType;
  parentId?: string;
  accountingCode?: string;
}
