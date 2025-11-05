import { Controller, Get, Post, Body, Inject, UseInterceptors, Query, Param } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { CreateLinkDto } from './dto/create-link.dto';
import { ListLinksDto } from './dto/list-link.dto';
import { LinkService } from './link.service';

@ApiTags('link')
@Controller('link')
export class LinkController {
  constructor(@Inject(LinkService) private readonly linkService: LinkService) {}

  @Get()
  async findAll() {
    return this.linkService.listLinks();
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(@Body() dto: CreateLinkDto) {
    return this.linkService.createLink(dto);
  }
  @Get('pagination')
  async findAllPagination(@Query() q: ListLinksDto) {
    return this.linkService.listLinksPaginated(q.limit ?? 10, q.cursor);
  }

  @Get(':code')
  async getByCode(@Param('code') code: string) {
    return this.linkService.getByCode(code);
  }
}
