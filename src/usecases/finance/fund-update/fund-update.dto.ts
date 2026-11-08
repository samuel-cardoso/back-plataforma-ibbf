export interface FundUpdateInput {
  id: string;
  name?: string;
  active?: boolean;
  pixTxid?: string | null;
  sortOrder?: number;
}
