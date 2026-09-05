import { z } from 'zod';
import { familyResponseItemSchema, familyErrorSchema } from '../family-create/family-create.schema';

export const familyDetailsParamsSchema = z.object({
  id: z.string().uuid(),
});

export const familyDetailsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ family: familyResponseItemSchema }),
});

export { familyErrorSchema as familyDetailsErrorSchema };
