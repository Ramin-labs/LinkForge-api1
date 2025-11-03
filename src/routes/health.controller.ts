import { Controller, Get } from '@nestjs/common';

@Controller('healthz')
export class HealthController {
  @Get()
  healthz() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
