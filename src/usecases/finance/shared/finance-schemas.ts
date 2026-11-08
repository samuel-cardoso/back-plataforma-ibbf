import { z } from 'zod';

export const financeTransactionKindSchema = z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'OPENING_BALANCE']);
export const paymentMethodSchema = z.enum(['CASH', 'PIX', 'CARD', 'BANK_TRANSFER', 'CHECK', 'BOLETO']);
export const financeRoleSchema = z.enum(['TREASURER', 'FISCAL_COUNCIL', 'PASTOR_VIEWER', 'COUNTER']);

/** Valor em centavos, sempre positivo na entrada; o sinal é decidido pelo tipo do lançamento. */
export const amountCentsSchema = z.number().int().positive().max(1_000_000_000);

export const financeTransactionItemSchema = z.object({
  id: z.string(),
  kind: financeTransactionKindSchema,
  date: z.string(),
  amountCents: z.number(),
  description: z.string().nullable(),
  fundId: z.string(),
  fundName: z.string().nullable(),
  cashAccountId: z.string(),
  cashAccountName: z.string().nullable(),
  categoryId: z.string().nullable(),
  categoryName: z.string().nullable(),
  method: paymentMethodSchema.nullable(),
  memberId: z.string().nullable().describe('Só preenchido para quem tem `canViewIndividualGiving`.'),
  memberName: z.string().nullable(),
  hasMember: z.boolean().describe('Indica que a entrada é identificada, sem revelar quem.'),
  documentNumber: z.string().nullable(),
  transferGroupId: z.string().nullable(),
  approvalReference: z.string().nullable(),
  reversesId: z.string().nullable(),
  reversedById: z.string().nullable(),
  createdAt: z.string(),
});

export const financeErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
