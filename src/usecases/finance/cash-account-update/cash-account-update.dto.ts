export interface CashAccountUpdateInput {
  id: string;
  name?: string;
  bankName?: string | null;
  active?: boolean;
}
