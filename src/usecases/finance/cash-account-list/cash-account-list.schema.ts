import { z } from 'zod';
import { cashAccountResponseItemSchema } from '../cash-account-create/cash-account-create.schema';

export const cashAccountListQuerySchema = z.object({
  activeOnly: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export const cashAccountListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ accounts: z.array(cashAccountResponseItemSchema) }),
});
