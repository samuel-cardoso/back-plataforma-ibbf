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
      security: [{ bearerAuth: [] }],
      params: memberDeleteParamsSchema,
      response: { 200: memberDeleteResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MemberDeleteController>('memberDeleteController');
    return controller.handle(request, reply);
  });
}
