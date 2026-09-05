import { asClass, createContainer, InjectionMode, Lifetime } from 'awilix';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PrismaRoleRepository } from './infrastructure/prisma/prisma-role.repository';
import { PrismaUserRepository } from './infrastructure/prisma/prisma-user.repository';
import { PrismaMemberRepository } from './infrastructure/prisma/prisma-member.repository';
import { HealthCheckController } from './usecases/system/health-check/health-check.controller';
import { HealthCheckUseCase } from './usecases/system/health-check/health-check.usecase';
import { UserRegisterController } from './usecases/auth/user-register/user-register.controller';
import { UserRegisterUseCase } from './usecases/auth/user-register/user-register.usecase';
import { UserLoginController } from './usecases/auth/user-login/user-login.controller';
import { UserLoginUseCase } from './usecases/auth/user-login/user-login.usecase';
import { MemberCreateController } from './usecases/member/member-create/member-create.controller';
import { MemberCreateUseCase } from './usecases/member/member-create/member-create.usecase';
import { MemberListController } from './usecases/member/member-list/member-list.controller';
import { MemberListUseCase } from './usecases/member/member-list/member-list.usecase';
import { MemberDetailsController } from './usecases/member/member-details/member-details.controller';
import { MemberDetailsUseCase } from './usecases/member/member-details/member-details.usecase';
import { MemberUpdateController } from './usecases/member/member-update/member-update.controller';
import { MemberUpdateUseCase } from './usecases/member/member-update/member-update.usecase';
import { MemberDeleteController } from './usecases/member/member-delete/member-delete.controller';
import { MemberDeleteUseCase } from './usecases/member/member-delete/member-delete.usecase';

export const container = createContainer({ injectionMode: InjectionMode.PROXY });

container.register({
  prismaService: asClass(PrismaService).singleton(),

  // Repositories — um por processo (SINGLETON): não têm estado de requisição.
  roleRepository: asClass(PrismaRoleRepository, { lifetime: Lifetime.SINGLETON }),
  userRepository: asClass(PrismaUserRepository, { lifetime: Lifetime.SINGLETON }),
  memberRepository: asClass(PrismaMemberRepository, { lifetime: Lifetime.SINGLETON }),

  healthCheckUseCase: asClass(HealthCheckUseCase, { lifetime: Lifetime.SCOPED }),
  healthCheckController: asClass(HealthCheckController, { lifetime: Lifetime.SCOPED }),

  userRegisterUseCase: asClass(UserRegisterUseCase, { lifetime: Lifetime.SCOPED }),
  userRegisterController: asClass(UserRegisterController, { lifetime: Lifetime.SCOPED }),
  userLoginUseCase: asClass(UserLoginUseCase, { lifetime: Lifetime.SCOPED }),
  userLoginController: asClass(UserLoginController, { lifetime: Lifetime.SCOPED }),

  memberCreateUseCase: asClass(MemberCreateUseCase, { lifetime: Lifetime.SCOPED }),
  memberCreateController: asClass(MemberCreateController, { lifetime: Lifetime.SCOPED }),
  memberListUseCase: asClass(MemberListUseCase, { lifetime: Lifetime.SCOPED }),
  memberListController: asClass(MemberListController, { lifetime: Lifetime.SCOPED }),
  memberDetailsUseCase: asClass(MemberDetailsUseCase, { lifetime: Lifetime.SCOPED }),
  memberDetailsController: asClass(MemberDetailsController, { lifetime: Lifetime.SCOPED }),
  memberUpdateUseCase: asClass(MemberUpdateUseCase, { lifetime: Lifetime.SCOPED }),
  memberUpdateController: asClass(MemberUpdateController, { lifetime: Lifetime.SCOPED }),
  memberDeleteUseCase: asClass(MemberDeleteUseCase, { lifetime: Lifetime.SCOPED }),
  memberDeleteController: asClass(MemberDeleteController, { lifetime: Lifetime.SCOPED }),
});
