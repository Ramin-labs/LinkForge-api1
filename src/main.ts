import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use pino logger
  app.useLogger(app.get(Logger));

  // CORS (handy during dev)
  app.enableCors();

  // Swagger (/docs)
  const config = new DocumentBuilder()
    .setTitle('Service Template')
    .setDescription('API documentation')
    .setVersion('0.1.0')
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  const url = await app.getUrl();
  app.get(Logger).log(`HTTP server listening on ${url}`);
  app.get(Logger).log(`Health: ${url}/healthz | Docs: ${url}/docs`);
}

bootstrap();
