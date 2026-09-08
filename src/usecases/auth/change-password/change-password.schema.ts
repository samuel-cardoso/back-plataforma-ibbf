import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).describe('Senha atual do usuário autenticado.'),
  newPassword: z.string().min(6).describe('Nova senha (mínimo 6 caracteres).'),
});

export const changePasswordResponseSchema = z.object({
  success: z.literal(true),
});

export const changePasswordErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
