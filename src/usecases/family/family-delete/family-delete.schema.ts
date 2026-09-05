import { z } from 'zod';
import { familyErrorSchema } from '../family-create/family-create.schema';

export const familyDeleteParamsSchema = z.object({
  id: z.string().uuid(),
});

export const familyDeleteResponseSchema = z.object({
  success: z.literal(true),
});

export { familyErrorSchema as familyDeleteErrorSchema };
