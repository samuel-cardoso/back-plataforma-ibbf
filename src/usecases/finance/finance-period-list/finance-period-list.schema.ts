import { z } from 'zod';

export const financePeriodItemSchema = z.object({
  year: z.number(),
  month: z.number(),
  status: z.enum(['OPEN', 'CLOSED']),
  closedById: z.string().nullable(),
  closedAt: z.string().nullable(),
  reopenReason: z.string().nullable(),
});

export const financePeriodListQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
});

export const financePeriodListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ periods: z.array(financePeriodItemSchema) }),
});

export const financePeriodParamsSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const financePeriodResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ period: financePeriodItemSchema }),
});
