import { z } from 'zod';
import { fundResponseItemSchema } from '../fund-create/fund-create.schema';

export const fundListQuerySchema = z.object({
  activeOnly: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export const fundListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ funds: z.array(fundResponseItemSchema) }),
});
