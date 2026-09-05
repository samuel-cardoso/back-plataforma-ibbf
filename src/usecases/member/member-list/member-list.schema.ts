import { z } from 'zod';
import { PAGINATION } from '@/shared/constants';
import { memberResponseItemSchema, memberErrorSchema, memberTypeSchema, memberStatusSchema } from '../member-create/member-create.schema';

export const memberListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE).describe('Página (1-indexada).'),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT).describe(`Itens por página (máx. ${PAGINATION.MAX_LIMIT}).`),
  search: z.string().optional().describe('Busca por `fullName` (case-insensitive, substring).'),
  memberType: memberTypeSchema.optional().describe('Filtra por tipo exato de membro.'),
  memberStatus: memberStatusSchema.optional().describe('Filtra por status exato de membresia.'),
  familyId: z.string().uuid().optional().describe('Filtra membros pertencentes a esta família.'),
});

export const memberListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    members: z.array(memberResponseItemSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  }),
});

export { memberErrorSchema as memberListErrorSchema };
