import { z } from 'zod';
import { financeRoleSchema } from '../shared/finance-schemas';

export const financeRoleParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const financeRoleAssignSchema = z.object({
  role: financeRoleSchema,
  canViewIndividualGiving: z.boolean().optional().default(false).describe('Ver contribuições por pessoa (dado sensível).'),
});

export const financeRoleAssignResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    financeRole: z.object({ userId: z.string(), role: financeRoleSchema, canViewIndividualGiving: z.boolean() }),
  }),
});
