import { z } from 'zod';
import { memberResponseItemSchema, memberErrorSchema, memberTypeSchema, memberStatusSchema } from '../member-create/member-create.schema';

export const memberUpdateParamsSchema = z.object({
  id: z.string().uuid(),
});

export const memberUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  cpf: z.string().nullable().optional(),
  birthDate: z.coerce.date().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  memberType: memberTypeSchema.optional(),
  memberStatus: memberStatusSchema.optional(),
  joinedAt: z.coerce.date().optional(),
  baptized: z.boolean().optional(),
  familyId: z.string().uuid().nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
});

export const memberUpdateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ member: memberResponseItemSchema }),
});

export { memberErrorSchema as memberUpdateErrorSchema };
