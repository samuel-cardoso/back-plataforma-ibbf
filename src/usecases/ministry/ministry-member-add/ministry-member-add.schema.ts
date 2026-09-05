import { z } from 'zod';

export const memberMinistryRoleSchema = z.enum(['LEADER', 'MEMBER']);

export const ministryMemberAddParamsSchema = z.object({
  ministryId: z.string().uuid(),
});

export const ministryMemberAddSchema = z.object({
  memberId: z.string().uuid(),
  role: memberMinistryRoleSchema.optional(),
  joinedAt: z.coerce.date().optional(),
});

export const memberMinistryResponseItemSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  ministryId: z.string(),
  memberName: z.string().optional(),
  role: memberMinistryRoleSchema,
  joinedAt: z.string(),
});

export const ministryMemberAddResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ participation: memberMinistryResponseItemSchema }),
});

export const ministryMemberErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
