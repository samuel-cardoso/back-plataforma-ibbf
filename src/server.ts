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
    openapi: {
      info: {
        title: 'IBBF API',
        version: '0.1.0',
        description:
          'Backend da Plataforma IBBF — sistema de gestão para a comunidade da igreja. ' +
          'Cobre dois subdomínios: **Autenticação** (Role, User, RefreshToken) e ' +
          '**Administração de Membros** (Member, Family, Ministry, MemberMinistry).\n\n' +
          '### Autenticação\n' +
          'A maioria dos endpoints exige um JWT em `Authorization: Bearer <accessToken>`, obtido em ' +
          '`POST /auth/login` ou `POST /auth/register`. O accessToken expira rápido; use ' +
          '`POST /auth/refresh` com o `refreshToken` para renová-lo sem pedir a senha de novo.\n\n' +
          '### Autorização (RBAC)\n' +
          `Além de autenticado, algumas ações administrativas (criar/editar/excluir Member, Family, ` +
          `Ministry e gerenciar participações) exigem que a \`Role\` do usuário tenha \`level >= ${'40'}\` ` +
          '(Secretaria ou acima — ver o seed de roles). Endpoints só-leitura aceitam qualquer usuário autenticado.\n\n' +
          '### Formato de resposta\n' +
          'Sucesso: `{ "success": true, "data": {...} }`. Erro: `{ "success": false, "code": "ALGUM_CODE", "message": "..." }` ' +
          '— o `code` é estável e feito para ser tratado programaticamente pelo cliente; a `message` é só para humanos.',
      },
      tags: [
        { name: 'System', description: 'Endpoints públicos de infraestrutura (health check).' },
        { name: 'Auth', description: 'Registro, login e ciclo de vida do access/refresh token.' },
        { name: 'Member', description: 'Cadastro de membros da comunidade — o recurso central do subdomínio de Administração de Membros.' },
        { name: 'Family', description: 'Núcleos familiares aos quais um Member pode pertencer.' },
        { name: 'Ministry', description: 'Ministérios/departamentos da igreja e suas participações (MemberMinistry).' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT obtido em POST /auth/login, /auth/register ou /auth/refresh.',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });
  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });

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
