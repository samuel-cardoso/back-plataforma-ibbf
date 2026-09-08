import { asClass, createContainer, InjectionMode, Lifetime } from 'awilix';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PrismaRoleRepository } from './infrastructure/prisma/prisma-role.repository';
import { PrismaUserRepository } from './infrastructure/prisma/prisma-user.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/prisma/prisma-refresh-token.repository';
import { PrismaPasswordResetCodeRepository } from './infrastructure/prisma/prisma-password-reset-code.repository';
import { ResendMailerService } from './infrastructure/mail/resend-mailer.service';
import { PrismaMemberRepository } from './infrastructure/prisma/prisma-member.repository';
import { PrismaFamilyRepository } from './infrastructure/prisma/prisma-family.repository';
import { PrismaMinistryRepository } from './infrastructure/prisma/prisma-ministry.repository';
import { PrismaMemberMinistryRepository } from './infrastructure/prisma/prisma-member-ministry.repository';

import { HealthCheckController } from './usecases/system/health-check/health-check.controller';
import { HealthCheckUseCase } from './usecases/system/health-check/health-check.usecase';

import { UserRegisterController } from './usecases/auth/user-register/user-register.controller';
import { UserRegisterUseCase } from './usecases/auth/user-register/user-register.usecase';
import { UserLoginController } from './usecases/auth/user-login/user-login.controller';
import { UserLoginUseCase } from './usecases/auth/user-login/user-login.usecase';
import { TokenRefreshController } from './usecases/auth/token-refresh/token-refresh.controller';
import { TokenRefreshUseCase } from './usecases/auth/token-refresh/token-refresh.usecase';
import { LogoutController } from './usecases/auth/logout/logout.controller';
import { LogoutUseCase } from './usecases/auth/logout/logout.usecase';
import { ChangePasswordController } from './usecases/auth/change-password/change-password.controller';
import { ChangePasswordUseCase } from './usecases/auth/change-password/change-password.usecase';
import { ForgotPasswordController } from './usecases/auth/forgot-password/forgot-password.controller';
import { ForgotPasswordUseCase } from './usecases/auth/forgot-password/forgot-password.usecase';
import { ResetPasswordController } from './usecases/auth/reset-password/reset-password.controller';
import { ResetPasswordUseCase } from './usecases/auth/reset-password/reset-password.usecase';

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

import { FamilyCreateController } from './usecases/family/family-create/family-create.controller';
import { FamilyCreateUseCase } from './usecases/family/family-create/family-create.usecase';
import { FamilyListController } from './usecases/family/family-list/family-list.controller';
import { FamilyListUseCase } from './usecases/family/family-list/family-list.usecase';
import { FamilyDetailsController } from './usecases/family/family-details/family-details.controller';
import { FamilyDetailsUseCase } from './usecases/family/family-details/family-details.usecase';
import { FamilyUpdateController } from './usecases/family/family-update/family-update.controller';
import { FamilyUpdateUseCase } from './usecases/family/family-update/family-update.usecase';
import { FamilyDeleteController } from './usecases/family/family-delete/family-delete.controller';
import { FamilyDeleteUseCase } from './usecases/family/family-delete/family-delete.usecase';

import { MinistryCreateController } from './usecases/ministry/ministry-create/ministry-create.controller';
import { MinistryCreateUseCase } from './usecases/ministry/ministry-create/ministry-create.usecase';
import { MinistryListController } from './usecases/ministry/ministry-list/ministry-list.controller';
import { MinistryListUseCase } from './usecases/ministry/ministry-list/ministry-list.usecase';
import { MinistryDetailsController } from './usecases/ministry/ministry-details/ministry-details.controller';
import { MinistryDetailsUseCase } from './usecases/ministry/ministry-details/ministry-details.usecase';
import { MinistryUpdateController } from './usecases/ministry/ministry-update/ministry-update.controller';
import { MinistryUpdateUseCase } from './usecases/ministry/ministry-update/ministry-update.usecase';
import { MinistryDeleteController } from './usecases/ministry/ministry-delete/ministry-delete.controller';
import { MinistryDeleteUseCase } from './usecases/ministry/ministry-delete/ministry-delete.usecase';
import { MinistryMemberAddController } from './usecases/ministry/ministry-member-add/ministry-member-add.controller';
import { MinistryMemberAddUseCase } from './usecases/ministry/ministry-member-add/ministry-member-add.usecase';
import { MinistryMemberListController } from './usecases/ministry/ministry-member-list/ministry-member-list.controller';
import { MinistryMemberListUseCase } from './usecases/ministry/ministry-member-list/ministry-member-list.usecase';
import { MinistryMemberUpdateRoleController } from './usecases/ministry/ministry-member-update-role/ministry-member-update-role.controller';
import { MinistryMemberUpdateRoleUseCase } from './usecases/ministry/ministry-member-update-role/ministry-member-update-role.usecase';
import { MinistryMemberRemoveController } from './usecases/ministry/ministry-member-remove/ministry-member-remove.controller';
import { MinistryMemberRemoveUseCase } from './usecases/ministry/ministry-member-remove/ministry-member-remove.usecase';

export const container = createContainer({ injectionMode: InjectionMode.PROXY });

container.register({
  prismaService: asClass(PrismaService).singleton(),

  // Repositories — um por processo (SINGLETON): não têm estado de requisição.
  roleRepository: asClass(PrismaRoleRepository, { lifetime: Lifetime.SINGLETON }),
  userRepository: asClass(PrismaUserRepository, { lifetime: Lifetime.SINGLETON }),
  refreshTokenRepository: asClass(PrismaRefreshTokenRepository, { lifetime: Lifetime.SINGLETON }),
  passwordResetCodeRepository: asClass(PrismaPasswordResetCodeRepository, { lifetime: Lifetime.SINGLETON }),
  mailerService: asClass(ResendMailerService, { lifetime: Lifetime.SINGLETON }),
  memberRepository: asClass(PrismaMemberRepository, { lifetime: Lifetime.SINGLETON }),
  familyRepository: asClass(PrismaFamilyRepository, { lifetime: Lifetime.SINGLETON }),
  ministryRepository: asClass(PrismaMinistryRepository, { lifetime: Lifetime.SINGLETON }),
  memberMinistryRepository: asClass(PrismaMemberMinistryRepository, { lifetime: Lifetime.SINGLETON }),

  healthCheckUseCase: asClass(HealthCheckUseCase, { lifetime: Lifetime.SCOPED }),
  healthCheckController: asClass(HealthCheckController, { lifetime: Lifetime.SCOPED }),

  userRegisterUseCase: asClass(UserRegisterUseCase, { lifetime: Lifetime.SCOPED }),
  userRegisterController: asClass(UserRegisterController, { lifetime: Lifetime.SCOPED }),
  userLoginUseCase: asClass(UserLoginUseCase, { lifetime: Lifetime.SCOPED }),
  userLoginController: asClass(UserLoginController, { lifetime: Lifetime.SCOPED }),
  tokenRefreshUseCase: asClass(TokenRefreshUseCase, { lifetime: Lifetime.SCOPED }),
  tokenRefreshController: asClass(TokenRefreshController, { lifetime: Lifetime.SCOPED }),
  logoutUseCase: asClass(LogoutUseCase, { lifetime: Lifetime.SCOPED }),
  logoutController: asClass(LogoutController, { lifetime: Lifetime.SCOPED }),
  changePasswordUseCase: asClass(ChangePasswordUseCase, { lifetime: Lifetime.SCOPED }),
  changePasswordController: asClass(ChangePasswordController, { lifetime: Lifetime.SCOPED }),
  forgotPasswordUseCase: asClass(ForgotPasswordUseCase, { lifetime: Lifetime.SCOPED }),
  forgotPasswordController: asClass(ForgotPasswordController, { lifetime: Lifetime.SCOPED }),
  resetPasswordUseCase: asClass(ResetPasswordUseCase, { lifetime: Lifetime.SCOPED }),
  resetPasswordController: asClass(ResetPasswordController, { lifetime: Lifetime.SCOPED }),

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

  familyCreateUseCase: asClass(FamilyCreateUseCase, { lifetime: Lifetime.SCOPED }),
  familyCreateController: asClass(FamilyCreateController, { lifetime: Lifetime.SCOPED }),
  familyListUseCase: asClass(FamilyListUseCase, { lifetime: Lifetime.SCOPED }),
  familyListController: asClass(FamilyListController, { lifetime: Lifetime.SCOPED }),
  familyDetailsUseCase: asClass(FamilyDetailsUseCase, { lifetime: Lifetime.SCOPED }),
  familyDetailsController: asClass(FamilyDetailsController, { lifetime: Lifetime.SCOPED }),
  familyUpdateUseCase: asClass(FamilyUpdateUseCase, { lifetime: Lifetime.SCOPED }),
  familyUpdateController: asClass(FamilyUpdateController, { lifetime: Lifetime.SCOPED }),
  familyDeleteUseCase: asClass(FamilyDeleteUseCase, { lifetime: Lifetime.SCOPED }),
  familyDeleteController: asClass(FamilyDeleteController, { lifetime: Lifetime.SCOPED }),

  ministryCreateUseCase: asClass(MinistryCreateUseCase, { lifetime: Lifetime.SCOPED }),
  ministryCreateController: asClass(MinistryCreateController, { lifetime: Lifetime.SCOPED }),
  ministryListUseCase: asClass(MinistryListUseCase, { lifetime: Lifetime.SCOPED }),
  ministryListController: asClass(MinistryListController, { lifetime: Lifetime.SCOPED }),
  ministryDetailsUseCase: asClass(MinistryDetailsUseCase, { lifetime: Lifetime.SCOPED }),
  ministryDetailsController: asClass(MinistryDetailsController, { lifetime: Lifetime.SCOPED }),
  ministryUpdateUseCase: asClass(MinistryUpdateUseCase, { lifetime: Lifetime.SCOPED }),
  ministryUpdateController: asClass(MinistryUpdateController, { lifetime: Lifetime.SCOPED }),
  ministryDeleteUseCase: asClass(MinistryDeleteUseCase, { lifetime: Lifetime.SCOPED }),
  ministryDeleteController: asClass(MinistryDeleteController, { lifetime: Lifetime.SCOPED }),
  ministryMemberAddUseCase: asClass(MinistryMemberAddUseCase, { lifetime: Lifetime.SCOPED }),
  ministryMemberAddController: asClass(MinistryMemberAddController, { lifetime: Lifetime.SCOPED }),
  ministryMemberListUseCase: asClass(MinistryMemberListUseCase, { lifetime: Lifetime.SCOPED }),
  ministryMemberListController: asClass(MinistryMemberListController, { lifetime: Lifetime.SCOPED }),
  ministryMemberUpdateRoleUseCase: asClass(MinistryMemberUpdateRoleUseCase, { lifetime: Lifetime.SCOPED }),
  ministryMemberUpdateRoleController: asClass(MinistryMemberUpdateRoleController, { lifetime: Lifetime.SCOPED }),
  ministryMemberRemoveUseCase: asClass(MinistryMemberRemoveUseCase, { lifetime: Lifetime.SCOPED }),
  ministryMemberRemoveController: asClass(MinistryMemberRemoveController, { lifetime: Lifetime.SCOPED }),
});
