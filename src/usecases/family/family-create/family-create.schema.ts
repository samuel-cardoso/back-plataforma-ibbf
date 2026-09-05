import { z } from 'zod';

export const familyCreateSchema = z.object({
  name: z.string().min(1),
});

export const familyResponseItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export const familyCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ family: familyResponseItemSchema }),
});

export const familyErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
