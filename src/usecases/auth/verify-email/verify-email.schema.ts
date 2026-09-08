import { z } from 'zod';

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'Código deve conter 6 dígitos numéricos.').describe('Código enviado por email em POST /auth/register ou /auth/resend-verification.'),
});

export const verifyEmailResponseSchema = z.object({
  success: z.literal(true),
});

export const verifyEmailErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
