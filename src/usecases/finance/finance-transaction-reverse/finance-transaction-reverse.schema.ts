import { z } from 'zod';
import { financeTransactionItemSchema } from '../shared/finance-schemas';

export const financeTransactionReverseParamsSchema = z.object({
  id: z.string().uuid(),
});

export const financeTransactionReverseSchema = z.object({
  reason: z.string().min(1).max(300),
  date: z.coerce.date().optional().describe('Data do estorno (padrão: hoje). Precisa cair em mês aberto.'),
});

export const financeTransactionReverseResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ transactions: z.array(financeTransactionItemSchema) }),
});
