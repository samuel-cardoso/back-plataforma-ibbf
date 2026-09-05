import { z } from 'zod';
import { memberMinistryResponseItemSchema, memberMinistryRoleSchema, ministryMemberErrorSchema } from '../ministry-member-add/ministry-member-add.schema';

export const ministryMemberUpdateRoleParamsSchema = z.object({
  ministryId: z.string().uuid(),
  memberId: z.string().uuid(),
});

export const ministryMemberUpdateRoleSchema = z.object({
  role: memberMinistryRoleSchema,
});

export const ministryMemberUpdateRoleResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ participation: memberMinistryResponseItemSchema }),
});

export { ministryMemberErrorSchema as ministryMemberUpdateRoleErrorSchema };
