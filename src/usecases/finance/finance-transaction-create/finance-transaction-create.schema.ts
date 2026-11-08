import { z } from 'zod';
import { amountCentsSchema, financeTransactionItemSchema, paymentMethodSchema } from '../shared/finance-schemas';

export const financeTransactionCreateSchema = z.object({
  kind: z.enum(['INCOME', 'EXPENSE', 'OPENING_BALANCE']).describe('OPENING_BALANCE registra o saldo inicial de uma conta/fundo ao começar a usar o sistema.'),
  date: z.coerce.date(),
  amountCents: amountCentsSchema.describe('Valor positivo em centavos; despesas são gravadas como saída.'),
  fundId: z.string().uuid(),
  cashAccountId: z.string().uuid(),
  categoryId: z.string().uuid().optional().describe('Obrigatória para INCOME/EXPENSE e deve ser do mesmo tipo.'),
  method: paymentMethodSchema.optional(),
  memberId: z.string().uuid().optional().describe('Dízimo identificado. Exige `canViewIndividualGiving`.'),
  description: z.string().max(500).optional(),
  documentNumber: z.string().max(100).optional(),
});

export const financeTransactionCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ transaction: financeTransactionItemSchema }),
});
