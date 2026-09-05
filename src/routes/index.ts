import type { FastifyInstance } from 'fastify';
import { systemRoutes } from './system/system-router.factory';
import { authRoutes } from './auth/auth-router.factory';
import { memberRoutes } from './member/member-router.factory';

export async function registerRoutes(server: FastifyInstance) {
  await server.register(systemRoutes);
  await server.register(authRoutes, { prefix: '/auth' });
  await server.register(memberRoutes, { prefix: '/members' });
}
