import { z } from 'zod';

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const resendVerificationResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().describe('Mensagem genérica — não confirma se o email está cadastrado ou já verificado.'),
});
