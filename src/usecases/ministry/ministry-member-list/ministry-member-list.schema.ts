import { z } from 'zod';
import { PAGINATION } from '@/shared/constants';
import { memberMinistryResponseItemSchema, memberMinistryRoleSchema, ministryMemberErrorSchema } from '../ministry-member-add/ministry-member-add.schema';

export const ministryMemberListParamsSchema = z.object({
  ministryId: z.string().uuid(),
});

export const ministryMemberListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE).describe('Página (1-indexada).'),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT).describe(`Itens por página (máx. ${PAGINATION.MAX_LIMIT}).`),
  role: memberMinistryRoleSchema.optional().describe('Filtra só líderes (LEADER) ou só participantes comuns (MEMBER).'),
});

export const ministryMemberListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    participations: z.array(memberMinistryResponseItemSchema),
    pagination: z.object({ total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number() }),
  }),
});

export { ministryMemberErrorSchema as ministryMemberListErrorSchema };
