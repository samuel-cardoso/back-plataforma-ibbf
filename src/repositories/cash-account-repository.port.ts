import { CashAccount } from '@/models';

export interface CashAccountRepositoryPort {
  create(account: CashAccount): Promise<CashAccount>;
  findById(id: string): Promise<CashAccount | null>;
  findAll(filters: { activeOnly?: boolean }): Promise<CashAccount[]>;
  update(account: CashAccount): Promise<CashAccount>;
}
