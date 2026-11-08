import { z } from 'zod';
export { financePeriodParamsSchema, financePeriodResponseSchema } from '../finance-period-list/finance-period-list.schema';

export const financePeriodReopenSchema = z.object({
  reason: z.string().min(1).max(300),
});
