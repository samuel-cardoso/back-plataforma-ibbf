import type { FastifyInstance } from 'fastify';
import { STAFF_MIN_ROLE_LEVEL } from '@/shared/constants';
import type { MemberCreateController } from '@/usecases/member/member-create/member-create.controller';
import { memberCreateSchema, memberCreateResponseSchema, memberErrorSchema } from '@/usecases/member/member-create/member-create.schema';
import type { MemberListController } from '@/usecases/member/member-list/member-list.controller';
import { memberListQuerySchema, memberListResponseSchema } from '@/usecases/member/member-list/member-list.schema';
import type { MemberDetailsController } from '@/usecases/member/member-details/member-details.controller';
import { memberDetailsParamsSchema, memberDetailsResponseSchema } from '@/usecases/member/member-details/member-details.schema';
import type { MemberUpdateController } from '@/usecases/member/member-update/member-update.controller';
import { memberUpdateParamsSchema, memberUpdateSchema, memberUpdateResponseSchema } from '@/usecases/member/member-update/member-update.schema';
import type { MemberDeleteController } from '@/usecases/member/member-delete/member-delete.controller';
import { memberDeleteParamsSchema, memberDeleteResponseSchema } from '@/usecases/member/member-delete/member-delete.schema';

/**
 * Ver membro exige só estar autenticado; criar/editar/excluir exige
 * `authorize(STAFF_MIN_ROLE_LEVEL)` — role com level >= Secretaria.
 */
export async function memberRoutes(server: FastifyInstance) {
  server.get('/', {
    preHandler: [server.authenticate()],
    schema: {
      tags: ['Member'],
      summary: 'List members',
      description:
        'Lista membros com paginação, busca por nome e filtros por tipo/status/família. Requer apenas autenticação (qualquer role).',
      security: [{ bearerAuth: [] }],
      querystring: memberListQuerySchema,
      response: { 200: memberListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MemberListController>('memberListController');
    return controller.handle(request, reply);
  });

  server.get('/:id', {
    preHandler: [server.authenticate()],
    schema: {
      tags: ['Member'],
      summary: 'Get member details',
      description: 'Retorna um membro pelo id. Requer apenas autenticação. 404 se não existir.',
      security: [{ bearerAuth: [] }],
      params: memberDetailsParamsSchema,
      response: { 200: memberDetailsResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MemberDetailsController>('memberDetailsController');
    return controller.handle(request, reply);
  });

  server.post('/', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Member'],
      summary: 'Create a member',
      description:
        `Cria um novo cadastro de membro. Requer role com level >= ${STAFF_MIN_ROLE_LEVEL} (Secretaria ou acima). ` +
        'O CPF, se informado, deve ser único (11 dígitos, com ou sem máscara) — falha com `MEMBER.CPF_ALREADY_EXISTS`. ' +
        '`familyId`/`userId` inválidos falham com `MEMBER.INVALID_REFERENCE`.',
      security: [{ bearerAuth: [] }],
      body: memberCreateSchema,
      response: { 201: memberCreateResponseSchema, 400: memberErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MemberCreateController>('memberCreateController');
    return controller.handle(request, reply);
  });

  server.patch('/:id', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Member'],
      summary: 'Update a member',
      description:
        `Atualiza parcialmente um membro (só os campos enviados são alterados). Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: memberUpdateParamsSchema,
      body: memberUpdateSchema,
      response: { 200: memberUpdateResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MemberUpdateController>('memberUpdateController');
    return controller.handle(request, reply);
  });

  server.delete('/:id', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Member'],
      summary: 'Delete a member',
      description: `Remove um membro definitivamente. Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: memberDeleteParamsSchema,
      response: { 200: memberDeleteResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MemberDeleteController>('memberDeleteController');
    return controller.handle(request, reply);
  });
}
