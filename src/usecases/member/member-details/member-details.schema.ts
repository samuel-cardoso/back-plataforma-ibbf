import { z } from 'zod';
import { memberResponseItemSchema, memberErrorSchema } from '../member-create/member-create.schema';

export const memberDetailsParamsSchema = z.object({
  id: z.string().uuid(),
});

export const memberDetailsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ member: memberResponseItemSchema }),
});

export { memberErrorSchema as memberDetailsErrorSchema };
