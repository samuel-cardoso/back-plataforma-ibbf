import { RefreshToken } from '@/models';

export interface RefreshTokenRepositoryPort {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  update(refreshToken: RefreshToken): Promise<RefreshToken>;
}
