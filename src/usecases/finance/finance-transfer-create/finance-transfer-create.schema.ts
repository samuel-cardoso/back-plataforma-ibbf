import { z } from 'zod';
import { amountCentsSchema, financeTransactionItemSchema } from '../shared/finance-schemas';

const transferSideSchema = z.object({
  fundId: z.string().uuid(),
  cashAccountId: z.string().uuid(),
});

export const financeTransferCreateSchema = z.object({
  date: z.coerce.date(),
  amountCents: amountCentsSchema,
  from: transferSideSchema,
  to: transferSideSchema,
  description: z.string().max(500).optional(),
  approvalReference: z
    .string()
    .max(200)
    .optional()
    .describe('Obrigatória quando o fundo muda (ex.: "Ata da AGO de 10/03/2026"): mexer em recurso designado exige aprovação.'),
});

export const financeTransferCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ transactions: z.array(financeTransactionItemSchema) }),
});
