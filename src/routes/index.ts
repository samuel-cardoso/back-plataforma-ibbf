import type { FastifyInstance } from 'fastify';
import { systemRoutes } from './system/system-router.factory';
import { authRoutes } from './auth/auth-router.factory';

export async function registerRoutes(server: FastifyInstance) {
  await server.register(systemRoutes);
  await server.register(authRoutes, { prefix: '/auth' });
}
