import { z } from 'zod';

export const financeCategoryTypeSchema = z.enum(['INCOME', 'EXPENSE']);

export const financeCategoryCreateSchema = z.object({
  name: z.string().min(1),
  type: financeCategoryTypeSchema,
  parentId: z.string().uuid().optional(),
  accountingCode: z.string().optional().describe('Código no plano de contas do contador.'),
});

export const financeCategoryResponseItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: financeCategoryTypeSchema,
  parentId: z.string().nullable(),
  accountingCode: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
});

export const financeCategoryCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ category: financeCategoryResponseItemSchema }),
});

export const financeCategoryErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
