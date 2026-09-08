import { User } from '@/models';
import { DomainError, NotFoundError } from '@/shared/errors';
import { UserRepositoryPort } from '@/repositories';
import type { ChangePasswordInput } from './change-password.dto';

interface Dependencies {
  userRepository: UserRepositoryPort;
}

export class ChangePasswordUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const user = await this.dependencies.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('Usuário');
    }

    const currentPasswordMatches = await user.comparePassword(input.currentPassword);
    if (!currentPasswordMatches) {
      throw new DomainError('Senha atual incorreta', 'AUTH.INVALID_CURRENT_PASSWORD');
    }

    const newPasswordHash = await User.hashPassword(input.newPassword);
    await this.dependencies.userRepository.updatePassword(user.id as string, newPasswordHash);
  }
}
