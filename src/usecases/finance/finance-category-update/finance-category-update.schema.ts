import { z } from 'zod';
import { financeCategoryResponseItemSchema, financeCategoryErrorSchema } from '../finance-category-create/finance-category-create.schema';

export const financeCategoryUpdateParamsSchema = z.object({
  id: z.string().uuid(),
});

export const financeCategoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  parentId: z.string().uuid().nullable().optional(),
  accountingCode: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export const financeCategoryUpdateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ category: financeCategoryResponseItemSchema }),
});

export { financeCategoryErrorSchema as financeCategoryUpdateErrorSchema };
