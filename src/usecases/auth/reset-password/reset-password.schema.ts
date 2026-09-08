import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'Código deve conter 6 dígitos numéricos.').describe('Código enviado por email em POST /auth/forgot-password.'),
  newPassword: z.string().min(6).describe('Nova senha (mínimo 6 caracteres).'),
});

export const resetPasswordResponseSchema = z.object({
  success: z.literal(true),
});

export const resetPasswordErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
