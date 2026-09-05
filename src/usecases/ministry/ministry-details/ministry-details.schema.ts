import { z } from 'zod';
import { ministryResponseItemSchema, ministryErrorSchema } from '../ministry-create/ministry-create.schema';

export const ministryDetailsParamsSchema = z.object({
  id: z.string().uuid(),
});

export const ministryDetailsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ ministry: ministryResponseItemSchema }),
});

export { ministryErrorSchema as ministryDetailsErrorSchema };
