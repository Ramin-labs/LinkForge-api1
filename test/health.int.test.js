'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const supertest_1 = __importDefault(require('supertest'));
// Import your compiled AppModule from dist (CommonJS)
const { AppModule } = require('../dist/module.js');
let app;
beforeAll(async () => {
  const moduleRef = await testing_1.Test.createTestingModule({
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
  const res = await (0, supertest_1.default)(server).get('/healthz').expect(200);
  expect(res.body).toMatchObject({ ok: true });
});
//# sourceMappingURL=health.int.test.js.map
