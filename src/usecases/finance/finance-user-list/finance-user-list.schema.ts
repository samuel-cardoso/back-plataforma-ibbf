import { z } from 'zod';
import { financeRoleSchema } from '../shared/finance-schemas';

export const financeUserItemSchema = z.object({
  userId: z.string(),
  email: z.string(),
  roleName: z.string(),
  memberName: z.string().nullable(),
  financeRole: financeRoleSchema.nullable(),
  canViewIndividualGiving: z.boolean(),
});

export const financeUserListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ users: z.array(financeUserItemSchema) }),
});
