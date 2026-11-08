import { UserFinanceRole } from '@/models';

export interface FinanceUserListItem {
  userId: string;
  email: string;
  roleName: string;
  memberName: string | null;
  financeRole: UserFinanceRole | null;
}

export interface UserFinanceRoleRepositoryPort {
  findByUserId(userId: string): Promise<UserFinanceRole | null>;
  save(role: UserFinanceRole): Promise<UserFinanceRole>;
  deleteByUserId(userId: string): Promise<void>;
  /** Todos os usuários da plataforma com o papel financeiro de cada um (null = sem acesso ao financeiro). */
  listUsers(): Promise<FinanceUserListItem[]>;
}
