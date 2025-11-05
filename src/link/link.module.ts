import { Module } from '@nestjs/common';

import { CacheModule } from '../cache/cache.module';
import { PrismaModule } from '../prisma/prisma.module';

import { LinkController } from './link.controller';
import { LinkService } from './link.service';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [LinkService],
  controllers: [LinkController],
  exports: [LinkService],
})
export class LinkModule {}
