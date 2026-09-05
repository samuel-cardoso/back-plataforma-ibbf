import { z } from 'zod';
import { PAGINATION } from '@/shared/constants';
import { memberResponseItemSchema, memberErrorSchema } from '../member-create/member-create.schema';

export const memberListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().optional(),
});

export const memberListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    members: z.array(memberResponseItemSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  }),
});

export { memberErrorSchema as memberListErrorSchema };
