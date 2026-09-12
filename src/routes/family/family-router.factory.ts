import type { FastifyInstance } from 'fastify';
import { STAFF_MIN_ROLE_LEVEL } from '@samuel-cardoso/ibbf-authz';
import type { FamilyCreateController } from '@/usecases/family/family-create/family-create.controller';
import { familyCreateSchema, familyCreateResponseSchema, familyErrorSchema } from '@/usecases/family/family-create/family-create.schema';
import type { FamilyListController } from '@/usecases/family/family-list/family-list.controller';
import { familyListQuerySchema, familyListResponseSchema } from '@/usecases/family/family-list/family-list.schema';
import type { FamilyDetailsController } from '@/usecases/family/family-details/family-details.controller';
import { familyDetailsParamsSchema, familyDetailsResponseSchema } from '@/usecases/family/family-details/family-details.schema';
import type { FamilyUpdateController } from '@/usecases/family/family-update/family-update.controller';
import { familyUpdateParamsSchema, familyUpdateSchema, familyUpdateResponseSchema } from '@/usecases/family/family-update/family-update.schema';
import type { FamilyDeleteController } from '@/usecases/family/family-delete/family-delete.controller';
import { familyDeleteParamsSchema, familyDeleteResponseSchema } from '@/usecases/family/family-delete/family-delete.schema';

/** Ver família exige só autenticação; criar/editar/excluir exige level >= STAFF_MIN_ROLE_LEVEL. */
export async function familyRoutes(server: FastifyInstance) {
  server.get('/', {
    preHandler: [server.authenticate()],
    schema: {
      tags: ['Family'],
      summary: 'List families',
      description: 'Lista famílias com paginação e busca por nome. Requer apenas autenticação (qualquer role).',
      security: [{ bearerAuth: [] }],
      querystring: familyListQuerySchema,
      response: { 200: familyListResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FamilyListController>('familyListController');
    return controller.handle(request, reply);
  });

  server.get('/:id', {
    preHandler: [server.authenticate()],
    schema: {
      tags: ['Family'],
      summary: 'Get family details',
      description: 'Retorna uma família pelo id. Requer apenas autenticação. 404 se não existir.',
      security: [{ bearerAuth: [] }],
      params: familyDetailsParamsSchema,
      response: { 200: familyDetailsResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FamilyDetailsController>('familyDetailsController');
    return controller.handle(request, reply);
  });

  server.post('/', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Family'],
      summary: 'Create a family',
      description: `Cria uma nova família (ex: "Família Silva"). Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      body: familyCreateSchema,
      response: { 201: familyCreateResponseSchema, 400: familyErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FamilyCreateController>('familyCreateController');
    return controller.handle(request, reply);
  });

  server.patch('/:id', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Family'],
      summary: 'Update a family',
      description: `Renomeia uma família. Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: familyUpdateParamsSchema,
      body: familyUpdateSchema,
      response: { 200: familyUpdateResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FamilyUpdateController>('familyUpdateController');
    return controller.handle(request, reply);
  });

  server.delete('/:id', {
    preHandler: [server.authenticate(), server.authorize(STAFF_MIN_ROLE_LEVEL)],
    schema: {
      tags: ['Family'],
      summary: 'Delete a family',
      description:
        `Remove uma família. Membros vinculados NÃO são apagados — seu \`familyId\` simplesmente vira \`null\` (ON DELETE SET NULL). ` +
        `Requer role com level >= ${STAFF_MIN_ROLE_LEVEL}.`,
      security: [{ bearerAuth: [] }],
      params: familyDeleteParamsSchema,
      response: { 200: familyDeleteResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<FamilyDeleteController>('familyDeleteController');
    return controller.handle(request, reply);
  });
}
