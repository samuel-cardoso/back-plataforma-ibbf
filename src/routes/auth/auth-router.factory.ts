import type { FastifyInstance } from 'fastify';
import type { UserRegisterController } from '@/usecases/auth/user-register/user-register.controller';
import { userRegisterSchema, userRegisterResponseSchema, userRegisterErrorSchema } from '@/usecases/auth/user-register/user-register.schema';
import type { UserLoginController } from '@/usecases/auth/user-login/user-login.controller';
import { userLoginSchema, userLoginResponseSchema, userLoginErrorSchema } from '@/usecases/auth/user-login/user-login.schema';

/** Rotas públicas (sem autenticação): é aqui que o token de acesso nasce. */
export async function authRoutes(server: FastifyInstance) {
  server.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      body: userRegisterSchema,
      response: { 201: userRegisterResponseSchema, 400: userRegisterErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<UserRegisterController>('userRegisterController');
    return controller.handle(request, reply);
  });

  server.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login',
      body: userLoginSchema,
      response: { 200: userLoginResponseSchema, 400: userLoginErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<UserLoginController>('userLoginController');
    return controller.handle(request, reply);
  });
}
