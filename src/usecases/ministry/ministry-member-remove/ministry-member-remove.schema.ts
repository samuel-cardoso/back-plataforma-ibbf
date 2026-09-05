import { z } from 'zod';
import { ministryMemberErrorSchema } from '../ministry-member-add/ministry-member-add.schema';

export const ministryMemberRemoveParamsSchema = z.object({
  ministryId: z.string().uuid(),
  memberId: z.string().uuid(),
});

export const ministryMemberRemoveResponseSchema = z.object({
  success: z.literal(true),
});

export { ministryMemberErrorSchema as ministryMemberRemoveErrorSchema };
