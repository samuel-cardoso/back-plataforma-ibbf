import type { FastifyInstance } from 'fastify';
import type { HealthCheckController } from '@/usecases/system/health-check/health-check.controller';
import { healthCheckResponseSchema } from '@/usecases/system/health-check/health-check.schema';

export async function systemRoutes(server: FastifyInstance) {
  server.get('/health', {
    schema: {
      tags: ['System'], summary: 'Check API availability',
      response: { 200: healthCheckResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<HealthCheckController>('healthCheckController');
    return controller.handle(reply);
  });
}
