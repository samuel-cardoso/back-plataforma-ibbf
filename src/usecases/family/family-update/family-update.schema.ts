import { z } from 'zod';
import { familyResponseItemSchema, familyErrorSchema } from '../family-create/family-create.schema';

export const familyUpdateParamsSchema = z.object({
  id: z.string().uuid(),
});

export const familyUpdateSchema = z.object({
  name: z.string().min(1).optional(),
});

export const familyUpdateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ family: familyResponseItemSchema }),
});

export { familyErrorSchema as familyUpdateErrorSchema };
