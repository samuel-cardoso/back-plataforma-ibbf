import { z } from 'zod';
import { ministryErrorSchema } from '../ministry-create/ministry-create.schema';

export const ministryDeleteParamsSchema = z.object({
  id: z.string().uuid(),
});

export const ministryDeleteResponseSchema = z.object({
  success: z.literal(true),
});

export { ministryErrorSchema as ministryDeleteErrorSchema };
