import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Avoid connecting to the database during test runs.
    // Prisma will lazily establish a connection on the first query anyway.
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    await this.$connect();
  }
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
