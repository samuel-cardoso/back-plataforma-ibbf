import { z } from 'zod';

export const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const userRegisterResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      roleId: z.string(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']),
      lastLoginAt: z.string().datetime().nullable(),
      createdAt: z.string().datetime(),
    }),
    accessToken: z.string().describe('JWT de curta duração, enviado em `Authorization: Bearer <token>`.'),
    refreshToken: z.string().describe('Token de longa duração usado em POST /auth/refresh para renovar o accessToken.'),
  }),
});

export const userRegisterErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
