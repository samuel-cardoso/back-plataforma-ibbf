import { z } from 'zod';

export const healthCheckResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ status: z.literal('ok'), timestamp: z.string().datetime() }),
});
