import { z } from 'zod';
import { PAGINATION } from '@/shared/constants';
import { ministryResponseItemSchema, ministryErrorSchema } from '../ministry-create/ministry-create.schema';

export const ministryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE).describe('Página (1-indexada).'),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT).describe(`Itens por página (máx. ${PAGINATION.MAX_LIMIT}).`),
  search: z.string().optional().describe('Busca por `name` (case-insensitive, substring).'),
  leaderId: z.string().uuid().optional().describe('Filtra ministérios liderados por este Member.'),
});

export const ministryListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    ministries: z.array(ministryResponseItemSchema),
    pagination: z.object({ total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number() }),
  }),
});

export { ministryErrorSchema as ministryListErrorSchema };
