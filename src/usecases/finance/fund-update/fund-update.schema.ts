import { z } from 'zod';
import { fundResponseItemSchema, fundErrorSchema } from '../fund-create/fund-create.schema';

export const fundUpdateParamsSchema = z.object({
  id: z.string().uuid(),
});

export const fundUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  active: z.boolean().optional(),
  pixTxid: z.string().max(25).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const fundUpdateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ fund: fundResponseItemSchema }),
});

export { fundErrorSchema as fundUpdateErrorSchema };
