import type { FastifyInstance } from 'fastify';
import type { UserRegisterController } from '@/usecases/auth/user-register/user-register.controller';
import { userRegisterSchema, userRegisterResponseSchema, userRegisterErrorSchema } from '@/usecases/auth/user-register/user-register.schema';
import type { UserLoginController } from '@/usecases/auth/user-login/user-login.controller';
import { userLoginSchema, userLoginResponseSchema, userLoginErrorSchema } from '@/usecases/auth/user-login/user-login.schema';
import type { TokenRefreshController } from '@/usecases/auth/token-refresh/token-refresh.controller';
import { tokenRefreshSchema, tokenRefreshResponseSchema, tokenRefreshErrorSchema } from '@/usecases/auth/token-refresh/token-refresh.schema';
import type { LogoutController } from '@/usecases/auth/logout/logout.controller';
import { logoutSchema, logoutResponseSchema } from '@/usecases/auth/logout/logout.schema';
import type { ChangePasswordController } from '@/usecases/auth/change-password/change-password.controller';
import { changePasswordSchema, changePasswordResponseSchema, changePasswordErrorSchema } from '@/usecases/auth/change-password/change-password.schema';
import type { ForgotPasswordController } from '@/usecases/auth/forgot-password/forgot-password.controller';
import { forgotPasswordSchema, forgotPasswordResponseSchema } from '@/usecases/auth/forgot-password/forgot-password.schema';
import type { ResetPasswordController } from '@/usecases/auth/reset-password/reset-password.controller';
import { resetPasswordSchema, resetPasswordResponseSchema, resetPasswordErrorSchema } from '@/usecases/auth/reset-password/reset-password.schema';
import type { VerifyEmailController } from '@/usecases/auth/verify-email/verify-email.controller';
import { verifyEmailSchema, verifyEmailResponseSchema, verifyEmailErrorSchema } from '@/usecases/auth/verify-email/verify-email.schema';
import type { ResendVerificationController } from '@/usecases/auth/resend-verification/resend-verification.controller';
import { resendVerificationSchema, resendVerificationResponseSchema } from '@/usecases/auth/resend-verification/resend-verification.schema';

/** Rotas públicas (sem `authenticate()`): é aqui que o par access/refresh token nasce, se renova e morre. */
export async function authRoutes(server: FastifyInstance) {
  server.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description:
        'Cria uma conta de login (User) com a role padrão "Membro" e devolve um par accessToken/refreshToken já ' +
        'autenticado (auto-login, sem exigir confirmação de email antes). Em paralelo, envia por email um código ' +
        'de 6 dígitos que pode ser confirmado em `POST /auth/verify-email` — isso só marca `emailVerifiedAt` no ' +
        'perfil do usuário, não é obrigatório para logar. Falha com `USER.EMAIL_ALREADY_EXISTS` se o email já estiver em uso.',
      body: userRegisterSchema,
      response: { 201: userRegisterResponseSchema, 400: userRegisterErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<UserRegisterController>('userRegisterController');
    return controller.handle(request, reply);
  });

  server.post('/verify-email', {
    schema: {
      tags: ['Auth'],
      summary: 'Confirm the email verification code from /register',
      description:
        'Confirma o código de 6 dígitos enviado por `POST /auth/register` ou `POST /auth/resend-verification`, ' +
        'marcando `emailVerifiedAt` no perfil do usuário. Não afeta login nem emite tokens — é só um selo de ' +
        'confiança extra. Falha com `AUTH.INVALID_VERIFICATION_CODE` para email inexistente, código incorreto, já ' +
        'usado ou expirado (mesma mensagem em todos os casos), ou `AUTH.EMAIL_ALREADY_VERIFIED` se o email já tinha sido confirmado antes.',
      body: verifyEmailSchema,
      response: { 200: verifyEmailResponseSchema, 400: verifyEmailErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<VerifyEmailController>('verifyEmailController');
    return controller.handle(request, reply);
  });

  server.post('/resend-verification', {
    schema: {
      tags: ['Auth'],
      summary: 'Resend the email verification code',
      description:
        'Gera e envia um novo código de 6 dígitos para confirmar o email, caso o código de `POST /auth/register` ' +
        'tenha expirado (validade de 30 minutos) ou se perdido. Sempre responde 200 com uma mensagem genérica, ' +
        'mesmo se o email não estiver cadastrado ou já tiver sido verificado — evita usar esta rota para descobrir quais emails existem.',
      body: resendVerificationSchema,
      response: { 200: resendVerificationResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<ResendVerificationController>('resendVerificationController');
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

  server.post('/change-password', {
    preHandler: [server.authenticate()],
    schema: {
      tags: ['Auth'],
      summary: 'Change the password of the authenticated user',
      description:
        'Troca a senha do usuário autenticado, exigindo a senha atual. Falha com `AUTH.INVALID_CURRENT_PASSWORD` ' +
        'se `currentPassword` não conferir com a senha em vigor.',
      security: [{ bearerAuth: [] }],
      body: changePasswordSchema,
      response: { 200: changePasswordResponseSchema, 400: changePasswordErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<ChangePasswordController>('changePasswordController');
    return controller.handle(request, reply);
  });

  server.post('/forgot-password', {
    schema: {
      tags: ['Auth'],
      summary: 'Request a password reset code by email',
      description:
        'Envia por email (via Resend) um código de 6 dígitos, válido por 15 minutos, para trocar a senha em ' +
        '`POST /auth/reset-password`. Sempre responde 200 com uma mensagem genérica, mesmo se o email não estiver ' +
        'cadastrado ou o usuário não estiver ACTIVE — isso evita usar esta rota para descobrir quais emails existem.',
      body: forgotPasswordSchema,
      response: { 200: forgotPasswordResponseSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<ForgotPasswordController>('forgotPasswordController');
    return controller.handle(request, reply);
  });

  server.post('/reset-password', {
    schema: {
      tags: ['Auth'],
      summary: 'Reset the password using the code from /forgot-password',
      description:
        'Troca a senha usando o código de 6 dígitos enviado por `POST /auth/forgot-password`. O código só pode ser ' +
        'usado uma vez e expira em 15 minutos. Falha com `AUTH.INVALID_RESET_CODE` para email inexistente, código ' +
        'incorreto, já usado ou expirado — a mesma mensagem em todos os casos, para não revelar qual condição falhou.',
      body: resetPasswordSchema,
      response: { 200: resetPasswordResponseSchema, 400: resetPasswordErrorSchema },
    },
  }, async (request, reply) => {
    const controller = request.diScope.resolve<ResetPasswordController>('resetPasswordController');
    return controller.handle(request, reply);
  });
}
