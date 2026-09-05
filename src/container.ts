import { asClass, createContainer, InjectionMode, Lifetime } from 'awilix';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PrismaRoleRepository } from './infrastructure/prisma/prisma-role.repository';
import { PrismaUserRepository } from './infrastructure/prisma/prisma-user.repository';
import { HealthCheckController } from './usecases/system/health-check/health-check.controller';
import { HealthCheckUseCase } from './usecases/system/health-check/health-check.usecase';
import { UserRegisterController } from './usecases/auth/user-register/user-register.controller';
import { UserRegisterUseCase } from './usecases/auth/user-register/user-register.usecase';
import { UserLoginController } from './usecases/auth/user-login/user-login.controller';
import { UserLoginUseCase } from './usecases/auth/user-login/user-login.usecase';

export const container = createContainer({ injectionMode: InjectionMode.PROXY });

container.register({
  prismaService: asClass(PrismaService).singleton(),

  // Repositories — um por processo (SINGLETON): não têm estado de requisição.
  roleRepository: asClass(PrismaRoleRepository, { lifetime: Lifetime.SINGLETON }),
  userRepository: asClass(PrismaUserRepository, { lifetime: Lifetime.SINGLETON }),

  healthCheckUseCase: asClass(HealthCheckUseCase, { lifetime: Lifetime.SCOPED }),
  healthCheckController: asClass(HealthCheckController, { lifetime: Lifetime.SCOPED }),

  userRegisterUseCase: asClass(UserRegisterUseCase, { lifetime: Lifetime.SCOPED }),
  userRegisterController: asClass(UserRegisterController, { lifetime: Lifetime.SCOPED }),
  userLoginUseCase: asClass(UserLoginUseCase, { lifetime: Lifetime.SCOPED }),
  userLoginController: asClass(UserLoginController, { lifetime: Lifetime.SCOPED }),
});
