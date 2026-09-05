import { z } from 'zod';

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const userLoginResponseSchema = z.object({
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
    accessToken: z.string(),
  }),
});

export const userLoginErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
