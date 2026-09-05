import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import fastify, { type FastifyError } from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { container } from './container';
import { registerRoutes } from './routes';
import { DomainError, NotFoundError } from './shared/errors';

function isFastifyError(error: unknown): error is FastifyError {
  return error instanceof Error && 'code' in error && typeof (error as FastifyError).code === 'string';
}

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

  server.setErrorHandler((error, request, reply) => {
    if (error instanceof DomainError) {
      return reply.status(400).send({ success: false, code: error.code, message: error.message });
    }
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ success: false, code: 'NOT_FOUND', message: error.message });
    }
    if (isFastifyError(error) && error.code === 'FST_ERR_VALIDATION') {
      return reply.status(400).send({ success: false, code: 'VALIDATION_ERROR', message: error.message });
    }
    request.log.error(error);
    return reply.status(500).send({ success: false, code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' });
  });

  await registerRoutes(server);
  return server;
}
