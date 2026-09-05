import { z } from 'zod';

export const ministryCreateSchema = z.object({
  name: z.string().min(1),
  leaderId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const ministryResponseItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  leaderId: z.string().nullable(),
  description: z.string().nullable(),
});

export const ministryCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ ministry: ministryResponseItemSchema }),
});

export const ministryErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
