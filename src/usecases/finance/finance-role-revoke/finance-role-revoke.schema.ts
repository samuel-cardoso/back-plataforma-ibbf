import { z } from 'zod';
export { financeRoleParamsSchema } from '../finance-role-assign/finance-role-assign.schema';

export const financeRoleRevokeResponseSchema = z.object({ success: z.literal(true) });
