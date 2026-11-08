import { CashAccount } from '@/models';
import { CashAccountRepositoryPort, FinanceAuditLogRepositoryPort } from '@/repositories';
import { NotFoundError } from '@/shared/errors';
import type { CashAccountUpdateInput } from './cash-account-update.dto';

interface Dependencies {
  cashAccountRepository: CashAccountRepositoryPort;
  financeAuditLogRepository: FinanceAuditLogRepositoryPort;
}

export class CashAccountUpdateUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: CashAccountUpdateInput & { userId: string }): Promise<CashAccount> {
    const existing = await this.dependencies.cashAccountRepository.findById(input.id);
    if (!existing) throw new NotFoundError('Conta');

    const before = existing.toJSON();
    existing.update({ name: input.name, bankName: input.bankName, active: input.active });
    const updated = await this.dependencies.cashAccountRepository.update(existing);

    await this.dependencies.financeAuditLogRepository.record({
      userId: input.userId,
      action: 'UPDATE',
      entity: 'CashAccount',
      entityId: updated.id,
      data: { before, after: updated.toJSON() },
    });
    return updated;
  }
}
