import { z } from 'zod';
import { ministryResponseItemSchema, ministryErrorSchema } from '../ministry-create/ministry-create.schema';

export const ministryUpdateParamsSchema = z.object({
  id: z.string().uuid(),
});

export const ministryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  leaderId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const ministryUpdateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ ministry: ministryResponseItemSchema }),
});

export { ministryErrorSchema as ministryUpdateErrorSchema };
