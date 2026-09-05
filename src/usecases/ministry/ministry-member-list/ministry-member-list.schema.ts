import { z } from 'zod';
import { PAGINATION } from '@/shared/constants';
import { memberMinistryResponseItemSchema, ministryMemberErrorSchema } from '../ministry-member-add/ministry-member-add.schema';

export const ministryMemberListParamsSchema = z.object({
  ministryId: z.string().uuid(),
});

export const ministryMemberListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
});

export const ministryMemberListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    participations: z.array(memberMinistryResponseItemSchema),
    pagination: z.object({ total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number() }),
  }),
});

export { ministryMemberErrorSchema as ministryMemberListErrorSchema };
