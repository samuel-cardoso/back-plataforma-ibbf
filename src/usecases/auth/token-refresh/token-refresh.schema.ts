import { z } from 'zod';

export const tokenRefreshSchema = z.object({
  refreshToken: z.string().min(1).describe('Refresh token recebido em /auth/login, /auth/register ou numa chamada anterior a /auth/refresh.'),
});

export const tokenRefreshResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    accessToken: z.string().describe('Novo JWT de curta duração.'),
    refreshToken: z.string().describe('Novo refresh token — o anterior é revogado (rotação a cada uso).'),
  }),
});

export const tokenRefreshErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
