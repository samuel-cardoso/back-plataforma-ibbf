import { z } from 'zod';
import { financeRoleSchema } from '../shared/finance-schemas';

export const financeMeResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    financeRole: z
      .object({ role: financeRoleSchema, canViewIndividualGiving: z.boolean() })
      .nullable()
      .describe('null = usuário sem acesso ao financeiro.'),
    canManageRoles: z.boolean().describe('Pode atribuir papéis financeiros (Pastor Titular).'),
  }),
});
