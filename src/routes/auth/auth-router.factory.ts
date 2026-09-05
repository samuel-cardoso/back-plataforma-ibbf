import type { FastifyInstance } from 'fastify';
import type { UserRegisterController } from '@/usecases/auth/user-register/user-register.controller';
import { userRegisterSchema, userRegisterResponseSchema, userRegisterErrorSchema } from '@/usecases/auth/user-register/user-register.schema';
import type { UserLoginController } from '@/usecases/auth/user-login/user-login.controller';
import { userLoginSchema, userLoginResponseSchema, userLoginErrorSchema } from '@/usecases/auth/user-login/user-login.schema';
import type { TokenRefreshController } from '@/usecases/auth/token-refresh/token-refresh.controller';
import { tokenRefreshSchema, tokenRefreshResponseSchema, tokenRefreshErrorSchema } from '@/usecases/auth/token-refresh/token-refresh.schema';
import type { LogoutController } from '@/usecases/auth/logout/logout.controller';
import { logoutSchema, logoutResponseSchema } from '@/usecases/auth/logout/logout.schema';

/** Rotas públicas (sem `authenticate()`): é aqui que o par access/refresh token nasce, se renova e morre. */
export async function authRoutes(server: FastifyInstance) {
  server.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description:
        'Cria uma conta de login (User) com a role padrão "Membro" e devolve um par accessToken/refreshToken já autenticado — não requer confirmação de email. Falha com `USER.EMAIL_ALREADY_EXISTS` se o email já estiver em uso.',
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
      description:
        'Autentica por email/senha e devolve um novo par accessToken/refreshToken. Atualiza `lastLoginAt`. Retorna sempre a mesma mensagem genérica (`USER.INVALID_CREDENTIALS`) para email inexistente, usuário bloqueado/inativo ou senha incorreta, para não revelar qual credencial estava errada.',
      body: userLoginSchema,
      response: { 200: userLoginResponseSchema, 400: userLoginErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<UserLoginController>('userLoginController');
    return controller.handle(request, reply);
  });

  server.post('/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Refresh the access token',
      description:
        'Troca um refreshToken válido por um novo par accessToken/refreshToken (rotação: o refresh token usado é revogado nesta chamada, então cada um só pode ser usado uma vez). Não exige `Authorization` — o próprio refreshToken no corpo é a credencial. Falha com `AUTH.INVALID_REFRESH_TOKEN` se o token não existir, estiver expirado, já tiver sido revogado, ou se o usuário dono não estiver mais `ACTIVE`.',
      body: tokenRefreshSchema,
      response: { 200: tokenRefreshResponseSchema, 400: tokenRefreshErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<TokenRefreshController>('tokenRefreshController');
    return controller.handle(request, reply);
  });

  server.post('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout (revoke a refresh token)',
      description:
        'Revoga o refresh token informado, encerrando aquela sessão específica (outras sessões/dispositivos do mesmo usuário continuam válidas). Idempotente: sempre responde 200, mesmo se o token já estava revogado ou não existir.',
      body: logoutSchema,
      response: { 200: logoutResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<LogoutController>('logoutController');
    return controller.handle(request, reply);
  });
}
