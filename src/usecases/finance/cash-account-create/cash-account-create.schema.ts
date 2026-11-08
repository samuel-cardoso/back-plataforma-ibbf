import { z } from 'zod';

export const cashAccountKindSchema = z.enum(['CASH', 'BANK']);

export const cashAccountCreateSchema = z.object({
  name: z.string().min(1),
  kind: cashAccountKindSchema,
  bankName: z.string().optional(),
});

export const cashAccountResponseItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: cashAccountKindSchema,
  bankName: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
});

export const cashAccountCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ account: cashAccountResponseItemSchema }),
});

export const cashAccountErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
