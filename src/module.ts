import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { HealthController } from './routes/health.controller';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: isProd
        ? { level: process.env.LOG_LEVEL ?? 'info' }
        : {
            level: 'debug',
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, singleLine: true },
            },
          },
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
