import { User } from '@/models';

/**
 * Port = interface. O usecase depende SÓ disso, nunca da implementação Prisma
 * concreta — é isso que torna o usecase testável com um mock simples.
 */
export interface UserRepositoryPort {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateLastLogin(id: string, when: Date): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  updateEmailVerifiedAt(id: string, when: Date): Promise<void>;
}
