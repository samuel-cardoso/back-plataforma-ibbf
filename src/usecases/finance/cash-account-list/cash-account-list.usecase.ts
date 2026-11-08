import { CashAccountRepositoryPort } from '@/repositories';
import type { CashAccountListInput } from './cash-account-list.dto';

interface Dependencies {
  cashAccountRepository: CashAccountRepositoryPort;
}

export class CashAccountListUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: CashAccountListInput) {
    return this.dependencies.cashAccountRepository.findAll({ activeOnly: input.activeOnly });
  }
}
