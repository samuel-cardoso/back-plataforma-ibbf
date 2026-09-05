import { z } from 'zod';

export const logoutSchema = z.object({
  refreshToken: z.string().min(1).describe('Refresh token da sessão a encerrar.'),
});

export const logoutResponseSchema = z.object({
  success: z.literal(true),
});
