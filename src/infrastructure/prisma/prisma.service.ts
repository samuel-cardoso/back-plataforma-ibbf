import { PrismaClient } from '@prisma/client';

export class PrismaService {
  readonly client = new PrismaClient();

  async disconnect() {
    await this.client.$disconnect();
  }
}
