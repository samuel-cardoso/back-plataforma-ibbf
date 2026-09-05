import type { FastifyInstance } from 'fastify';
import { systemRoutes } from './system/system-router.factory';

export async function registerRoutes(server: FastifyInstance) {
  await server.register(systemRoutes);
}
