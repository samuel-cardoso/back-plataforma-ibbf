import { z } from 'zod';
import { PAGINATION } from '@/shared/constants';
import { familyResponseItemSchema, familyErrorSchema } from '../family-create/family-create.schema';

export const familyListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().optional(),
});

export const familyListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    families: z.array(familyResponseItemSchema),
    pagination: z.object({ total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number() }),
  }),
});

export { familyErrorSchema as familyListErrorSchema };
