import { Controller, Get, Param, Res, Inject } from '@nestjs/common';
import { Response } from 'express';

import { LinkService } from '../link/link.service';

@Controller() // root
export class RedirectController {
  constructor(@Inject(LinkService) private readonly linkService: LinkService) {}

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const target = await this.linkService.getTargetUrlByCodeFast(code);

    return res.redirect(target);
  }
}
