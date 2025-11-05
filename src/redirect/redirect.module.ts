// src/redirect/redirect.module.ts
import { Module } from '@nestjs/common';

import { LinkModule } from '../link/link.module';

import { RedirectController } from './redirect.controller';

@Module({
  imports: [LinkModule],
  controllers: [RedirectController],
})
export class RedirectModule {}
