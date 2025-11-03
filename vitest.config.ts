import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // allow 'test', 'expect' without imports
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
    },
    setupFiles: ['test/setup.ts'], // we’ll add reflect-metadata here
  },
});
