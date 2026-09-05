import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import fastify, { type FastifyError, type FastifyReply, type FastifyRequest, type onRequestHookHandler } from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { container } from './container';
import { registerRoutes } from './routes';
import { DomainError, NotFoundError } from './shared/errors';
import type { RoleRepositoryPort, UserRepositoryPort } from './repositories';
import type { TokenPayload } from './fastify-jwt.d';

function isFastifyError(error: unknown): error is FastifyError {
  return error instanceof Error && 'code' in error && typeof (error as FastifyError).code === 'string';
}

const JWT_ERROR_CODES = new Set([
  'FST_JWT_AUTHORIZATION_TOKEN_INVALID',
  'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
  'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED',
]);

export async function createServer() {
  const server = fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } }).withTypeProvider<ZodTypeProvider>();
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  await server.register(cors, { origin: process.env.WEB_ORIGIN ?? true });
  await server.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production' });
  await server.register(fastifyAwilixPlugin, { container, disposeOnClose: true, disposeOnResponse: true });
  await server.register(swagger, {
    openapi: { info: { title: 'IBBF API', version: '0.1.0' } },
    transform: jsonSchemaTransform,
  });
  await server.register(swaggerUi, { routePrefix: '/docs' });

  // ===== Decorators de autenticação/autorização (usados como preHandler nas rotas) =====

  server.decorate('authenticate', (): onRequestHookHandler => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();

        const userRepository = request.diScope.resolve<UserRepositoryPort>('userRepository');
        const userEntity = await userRepository.findById((request.user as TokenPayload).sub);

        if (!userEntity) {
          return reply.status(401).send({ success: false, code: 'UNAUTHORIZED', message: 'Usuário não encontrado' });
        }

        request.userEntity = userEntity;
      } catch (error) {
        reply.send(error);
      }
    };
  });

  server.decorate('authorize', (minLevel: number): onRequestHookHandler => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.userEntity) {
        return reply.status(401).send({ success: false, code: 'UNAUTHORIZED', message: 'Não autenticado' });
      }

      const roleRepository = request.diScope.resolve<RoleRepositoryPort>('roleRepository');
      const role = await roleRepository.findById(request.userEntity.roleId);

      if (!role || role.level < minLevel) {
        return reply.status(403).send({ success: false, code: 'FORBIDDEN', message: 'Você não tem permissão para executar esta ação' });
      }
    };
  });

  // ===== Error handler global =====
  server.setErrorHandler((error, request, reply) => {
    if (error instanceof DomainError) {
      return reply.status(400).send({ success: false, code: error.code, message: error.message });
    }
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ success: false, code: 'NOT_FOUND', message: error.message });
    }
    if (isFastifyError(error)) {
      if (error.code === 'FST_ERR_VALIDATION') {
        return reply.status(400).send({ success: false, code: 'VALIDATION_ERROR', message: error.message });
      }
      if (JWT_ERROR_CODES.has(error.code)) {
        return reply.status(401).send({ success: false, code: 'UNAUTHORIZED', message: 'Token inválido ou ausente' });
      }
    }
    request.log.error(error);
    return reply.status(500).send({ success: false, code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' });
  });

  await registerRoutes(server);
  return server;
}
