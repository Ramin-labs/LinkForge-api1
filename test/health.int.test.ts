import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

// Import your compiled AppModule from dist (CommonJS)
const { AppModule } = require('../dist/module.js');

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app?.close();
});

test('GET /healthz -> 200 { ok: true }', async () => {
  const server = app.getHttpServer();
  const res = await request(server).get('/healthz').expect(200);
  expect(res.body).toMatchObject({ ok: true });
});
