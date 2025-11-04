import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  Body,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { CreateLinkDto } from './dto/create-link.dto';
import { LinkService } from './link.service';

@ApiTags('link')
@Controller('link')
export class LinkController {
  constructor(@Inject(LinkService) private readonly linkService: LinkService) {}

  @Get('healthz')
  healthz() {
    return { ok: true };
  }

  @Get(':code')
  async redirect(@Param('code') code: string) {
    // placeholder; real impl: check Redis -> DB, enqueue click, 302
    throw new NotFoundException(`code ${code} not found`);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(@Body() dto: CreateLinkDto) {
    return this.linkService.createLink(dto);
  }
}
