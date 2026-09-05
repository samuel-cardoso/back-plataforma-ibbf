import { z } from 'zod';

export const memberTypeSchema = z.enum(['MEMBER', 'CONGREGANT', 'VISITOR']);
export const memberStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED']);

export const memberCreateSchema = z.object({
  fullName: z.string().min(1),
  cpf: z.string().optional(),
  birthDate: z.coerce.date(),
  phone: z.string().optional(),
  address: z.string().optional(),
  memberType: memberTypeSchema,
  memberStatus: memberStatusSchema.optional(),
  joinedAt: z.coerce.date().optional(),
  baptized: z.boolean().optional(),
  userId: z.string().uuid().optional(),
  familyId: z.string().uuid().optional(),
});

export const memberResponseItemSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  familyId: z.string().nullable(),
  fullName: z.string(),
  cpf: z.string().nullable(),
  birthDate: z.string(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  memberType: memberTypeSchema,
  memberStatus: memberStatusSchema,
  joinedAt: z.string(),
  baptized: z.boolean(),
});

export const memberCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ member: memberResponseItemSchema }),
});

export const memberErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
});
