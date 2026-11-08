import type { CashAccountKind } from '@/models';

export interface CashAccountCreateInput {
  name: string;
  kind: CashAccountKind;
  bankName?: string;
}
