export interface FinanceCategoryUpdateInput {
  id: string;
  name?: string;
  parentId?: string | null;
  accountingCode?: string | null;
  active?: boolean;
}
