import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables
beforeAll(() => {
  vi.stubEnv('AUTH_SECRET', 'test-secret-key-for-testing-purposes-only');
  vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
  vi.stubEnv('PHP_INTEGRATION_DIR', '/tmp/test-integrations');
  vi.stubEnv('PHP_INTEGRATION_URL', 'http://localhost/test-integrations');
  vi.stubEnv('NODE_ENV', 'test');
});

afterAll(() => {
  vi.restoreAllMocks();
});
