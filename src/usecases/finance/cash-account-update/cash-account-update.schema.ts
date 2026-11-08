import { z } from 'zod';
import { cashAccountResponseItemSchema, cashAccountErrorSchema } from '../cash-account-create/cash-account-create.schema';

export const cashAccountUpdateParamsSchema = z.object({
  id: z.string().uuid(),
});

export const cashAccountUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  bankName: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export const cashAccountUpdateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ account: cashAccountResponseItemSchema }),
});

export { cashAccountErrorSchema as cashAccountUpdateErrorSchema };
