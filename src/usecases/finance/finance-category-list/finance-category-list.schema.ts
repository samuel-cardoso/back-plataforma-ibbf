import { z } from 'zod';
import { financeCategoryResponseItemSchema, financeCategoryTypeSchema } from '../finance-category-create/finance-category-create.schema';

export const financeCategoryListQuerySchema = z.object({
  type: financeCategoryTypeSchema.optional(),
  activeOnly: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export const financeCategoryListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ categories: z.array(financeCategoryResponseItemSchema) }),
});
