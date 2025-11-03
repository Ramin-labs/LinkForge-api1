// Use CommonJS require importing compiled JS reliably in Node
// (This avoids ESM/CJS interop headaches.)
const { HealthController } = require('../dist/routes/health.controller.js');

test('healthz returns ok + ISO timestamp', () => {
  const c = new HealthController();
  const res = c.healthz();
  expect(res.ok).toBe(true);
  // Loose check that it's an ISO string
  expect(typeof res.ts).toBe('string');
  expect(() => new Date(res.ts).toISOString()).not.toThrow();
});
