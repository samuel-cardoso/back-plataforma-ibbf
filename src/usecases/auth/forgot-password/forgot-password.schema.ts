import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().describe('Mensagem genérica — não confirma se o email está cadastrado.'),
});
