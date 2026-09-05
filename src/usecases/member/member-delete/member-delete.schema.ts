import { z } from 'zod';
import { memberErrorSchema } from '../member-create/member-create.schema';

export const memberDeleteParamsSchema = z.object({
  id: z.string().uuid(),
});

export const memberDeleteResponseSchema = z.object({
  success: z.literal(true),
});

export { memberErrorSchema as memberDeleteErrorSchema };
