import { z } from 'zod';

export const fundCreateSchema = z.object({
  name: z.string().min(1),
  restricted: z.boolean().optional().describe('Fundo com restrição (ex.: Missões): só pode ser gasto na finalidade e nunca fica negativo. Não pode ser alterado depois.'),
  pixTxid: z.string().max(25).optional().describe('txid fixo do QR Pix estático deste fundo (letras e números).'),
  sortOrder: z.number().int().optional(),
});

export const fundResponseItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  restricted: z.boolean(),
  active: z.boolean(),
  pixTxid: z.string().nullable(),
  sortOrder: z.number(),
  createdAt: z.string(),
});

export const fundCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ fund: fundResponseItemSchema }),
});

export const fundErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
