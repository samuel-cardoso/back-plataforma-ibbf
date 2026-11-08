import { CashAccount } from '@/models';
import { CashAccountRepositoryPort, FinanceAuditLogRepositoryPort } from '@/repositories';
import type { CashAccountCreateInput } from './cash-account-create.dto';

interface Dependencies {
  cashAccountRepository: CashAccountRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class CashAccountCreateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: CashAccountCreateInput & { userId: string }): Promise<CashAccount> {
    const created = await this.dependencies.cashAccountRepository.create(CashAccount.create({ name: input.name, kind: input.kind, bankName: input.bankName }));
    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'CREATE',
      entity: 'CashAccount',
      entityId: created.id,
      data: created.toJSON(),
    });
    return created;
  }
}
