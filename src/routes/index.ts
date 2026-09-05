import type { FastifyInstance } from 'fastify';
import { systemRoutes } from './system/system-router.factory';
import { authRoutes } from './auth/auth-router.factory';
import { memberRoutes } from './member/member-router.factory';
import { familyRoutes } from './family/family-router.factory';
import { ministryRoutes } from './ministry/ministry-router.factory';

export async function registerRoutes(server: FastifyInstance) {
  await server.register(systemRoutes);
  await server.register(authRoutes, { prefix: '/auth' });
  await server.register(memberRoutes, { prefix: '/members' });
  await server.register(familyRoutes, { prefix: '/families' });
  await server.register(ministryRoutes, { prefix: '/ministries' });
}
