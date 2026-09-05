import type { FastifyInstance } from 'fastify';
import { STAFF_MIN_ROLE_LEVEL } from '@/shared/constants';
import type { MinistryCreateController } from '@/usecases/ministry/ministry-create/ministry-create.controller';
import { ministryCreateSchema, ministryCreateResponseSchema, ministryErrorSchema } from '@/usecases/ministry/ministry-create/ministry-create.schema';
import type { MinistryListController } from '@/usecases/ministry/ministry-list/ministry-list.controller';
import { ministryListQuerySchema, ministryListResponseSchema } from '@/usecases/ministry/ministry-list/ministry-list.schema';
import type { MinistryDetailsController } from '@/usecases/ministry/ministry-details/ministry-details.controller';
import { ministryDetailsParamsSchema, ministryDetailsResponseSchema } from '@/usecases/ministry/ministry-details/ministry-details.schema';
import type { MinistryUpdateController } from '@/usecases/ministry/ministry-update/ministry-update.controller';
import { ministryUpdateParamsSchema, ministryUpdateSchema, ministryUpdateResponseSchema } from '@/usecases/ministry/ministry-update/ministry-update.schema';
import type { MinistryDeleteController } from '@/usecases/ministry/ministry-delete/ministry-delete.controller';
import { ministryDeleteParamsSchema, ministryDeleteResponseSchema } from '@/usecases/ministry/ministry-delete/ministry-delete.schema';
import type { MinistryMemberAddController } from '@/usecases/ministry/ministry-member-add/ministry-member-add.controller';
import { ministryMemberAddParamsSchema, ministryMemberAddSchema, ministryMemberAddResponseSchema, ministryMemberErrorSchema } from '@/usecases/ministry/ministry-member-add/ministry-member-add.schema';
import type { MinistryMemberListController } from '@/usecases/ministry/ministry-member-list/ministry-member-list.controller';
import { ministryMemberListParamsSchema, ministryMemberListQuerySchema, ministryMemberListResponseSchema } from '@/usecases/ministry/ministry-member-list/ministry-member-list.schema';
import type { MinistryMemberUpdateRoleController } from '@/usecases/ministry/ministry-member-update-role/ministry-member-update-role.controller';
import { ministryMemberUpdateRoleParamsSchema, ministryMemberUpdateRoleSchema, ministryMemberUpdateRoleResponseSchema } from '@/usecases/ministry/ministry-member-update-role/ministry-member-update-role.schema';
import type { MinistryMemberRemoveController } from '@/usecases/ministry/ministry-member-remove/ministry-member-remove.controller';
import { ministryMemberRemoveParamsSchema, ministryMemberRemoveResponseSchema } from '@/usecases/ministry/ministry-member-remove/ministry-member-remove.schema';

/**
 * Ver ministério/participantes exige só autenticação; criar/editar/excluir
 * ministério e gerenciar participantes exige level >= STAFF_MIN_ROLE_LEVEL.
 */
export async function ministryRoutes(server: FastifyInstance) {
  server.get('/', {
    preHandler: [server.authenticate()],
    schema: {
      tags: ['Ministry'],
      summary: 'List ministries',
      description: 'Lista ministérios com paginação, busca por nome e filtro por líder. Requer apenas autenticação.',
      security: [{ bearerAuth: [] }],
      querystring: ministryListQuerySchema,
      response: { 200: ministryListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MinistryListController>('ministryListController');
    return controller.handle(request, reply);
  });

  server.get('/:id', {
    preHandler: [server.authenticate()],
    schema: {
      tags: ['Ministry'],
      summary: 'Get ministry details',
      description: 'Retorna um ministério pelo id. Requer apenas autenticação. 404 se não existir.',
      security: [{ bearerAuth: [] }],
      params: ministryDetailsParamsSchema,
      response: { 200: ministryDetailsResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MinistryDetailsController>('ministryDetailsController');
    return controller.handle(request, reply);
  });

  server.post('/', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Ministry'],
      summary: 'Create a ministry',
      description:
        `Cria um novo ministério (ex: "Louvor", "Infantil"). O nome deve ser único (\`MINISTRY.NAME_ALREADY_EXISTS\`). ` +
        `\`leaderId\`, se informado, deve ser o id de um Member existente. Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      body: ministryCreateSchema,
      response: { 201: ministryCreateResponseSchema, 400: ministryErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MinistryCreateController>('ministryCreateController');
    return controller.handle(request, reply);
  });

  server.patch('/:id', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Ministry'],
      summary: 'Update a ministry',
      description:
        `Atualiza nome, descrição ou líder do ministério (envie \`leaderId: null\` para remover o líder). Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: ministryUpdateParamsSchema,
      body: ministryUpdateSchema,
      response: { 200: ministryUpdateResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MinistryUpdateController>('ministryUpdateController');
    return controller.handle(request, reply);
  });

  server.delete('/:id', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Ministry'],
      summary: 'Delete a ministry',
      description:
        `Remove um ministério e todas as participações (MemberMinistry) associadas a ele (ON DELETE CASCADE). Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: ministryDeleteParamsSchema,
      response: { 200: ministryDeleteResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MinistryDeleteController>('ministryDeleteController');
    return controller.handle(request, reply);
  });

  // ===== Participantes (MemberMinistry) =====
  // Resolve a relação N:N entre Member e Ministry — ver ERD "Administração de Membros".

  server.get('/:ministryId/members', {
    preHandler: [server.authenticate()],
    schema: {
      tags: ['Ministry'],
      summary: 'List ministry participants',
      description:
        'Lista os membros que participam deste ministério, com `memberName` já resolvido via join. Filtro opcional por `role` (LEADER/MEMBER). Requer apenas autenticação.',
      security: [{ bearerAuth: [] }],
      params: ministryMemberListParamsSchema,
      querystring: ministryMemberListQuerySchema,
      response: { 200: ministryMemberListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MinistryMemberListController>('ministryMemberListController');
    return controller.handle(request, reply);
  });

  server.post('/:ministryId/members', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Ministry'],
      summary: 'Add a member to the ministry',
      description:
        `Registra a participação de um Member neste Ministry, com papel LEADER ou MEMBER (padrão: MEMBER). Falha com \`MEMBER_MINISTRY.ALREADY_PARTICIPATING\` se o membro já participar. Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}. Isto não altera o \`leaderId\` do ministério — para definir o líder "oficial", use PATCH /ministries/:id.`,
      security: [{ bearerAuth: [] }],
      params: ministryMemberAddParamsSchema,
      body: ministryMemberAddSchema,
      response: { 201: ministryMemberAddResponseSchema, 400: ministryMemberErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MinistryMemberAddController>('ministryMemberAddController');
    return controller.handle(request, reply);
  });

  server.patch('/:ministryId/members/:memberId', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Ministry'],
      summary: 'Update a participant role',
      description: `Troca o papel (LEADER/MEMBER) de um participante já existente. 404 se o membro não participar do ministério. Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: ministryMemberUpdateRoleParamsSchema,
      body: ministryMemberUpdateRoleSchema,
      response: { 200: ministryMemberUpdateRoleResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MinistryMemberUpdateRoleController>('ministryMemberUpdateRoleController');
    return controller.handle(request, reply);
  });

  server.delete('/:ministryId/members/:memberId', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Ministry'],
      summary: 'Remove a member from the ministry',
      description: `Remove a participação de um membro no ministério. 404 se ele não participar. Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: ministryMemberRemoveParamsSchema,
      response: { 200: ministryMemberRemoveResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<MinistryMemberRemoveController>('ministryMemberRemoveController');
    return controller.handle(request, reply);
  });
}
