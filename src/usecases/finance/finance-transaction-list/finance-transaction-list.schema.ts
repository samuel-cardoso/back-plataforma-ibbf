import { z } from 'zod';
import { PAGINATION } from '@/shared/constants';
import { financeTransactionItemSchema, financeTransactionKindSchema } from '../shared/finance-schemas';

export const financeTransactionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
  from: z.coerce.date().optional().describe('Data inicial (inclusive).'),
  to: z.coerce.date().optional().describe('Data final (inclusive).'),
  fundId: z.string().uuid().optional(),
  cashAccountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  kind: financeTransactionKindSchema.optional(),
  search: z.string().optional().describe('Busca na descrição e no número do documento.'),
});

export const financeTransactionListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    transactions: z.array(financeTransactionItemSchema),
    pagination: z.object({ total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number() }),
  }),
});
