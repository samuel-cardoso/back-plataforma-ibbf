import { z } from 'zod';

export const financeSummaryQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

const namedAmountSchema = z.object({ id: z.string(), name: z.string(), amountCents: z.number() });

export const financeSummaryResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    period: z.object({ year: z.number(), month: z.number(), status: z.enum(['OPEN', 'CLOSED']) }),
    balances: z.object({
      funds: z.array(z.object({ id: z.string(), name: z.string(), restricted: z.boolean(), balanceCents: z.number() })),
      accounts: z.array(z.object({ id: z.string(), name: z.string(), kind: z.enum(['CASH', 'BANK']), balanceCents: z.number() })),
      totalCents: z.number().describe('Soma dos saldos; é a mesma pelos fundos e pelas contas.'),
    }),
    month: z.object({
      incomeByFund: z.array(namedAmountSchema),
      incomeByCategory: z.array(namedAmountSchema),
      expenseByCategory: z.array(namedAmountSchema),
      totalIncomeCents: z.number(),
      totalExpenseCents: z.number(),
    }),
  }),
});
