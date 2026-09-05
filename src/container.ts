import { asClass, createContainer, InjectionMode, Lifetime } from 'awilix';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { HealthCheckController } from './usecases/system/health-check/health-check.controller';
import { HealthCheckUseCase } from './usecases/system/health-check/health-check.usecase';

export const container = createContainer({ injectionMode: InjectionMode.PROXY });

container.register({
  prismaService: asClass(PrismaService).singleton(),
  healthCheckUseCase: asClass(HealthCheckUseCase, { lifetime: Lifetime.SCOPED }),
  healthCheckController: asClass(HealthCheckController, { lifetime: Lifetime.SCOPED }),
});
