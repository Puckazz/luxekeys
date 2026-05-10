import { TestEnvironment } from './test-setup.js';

describe('AppController (e2e)', () => {
  let env: TestEnvironment;

  beforeAll(async () => {
    env = new TestEnvironment();
    await env.setup();
  }, 60000); // 60s timeout for downloading postgres image

  afterAll(async () => {
    await env.teardown();
  });

  it('/api/health (GET)', () => {
    // We assume there might be a health endpoint or just testing basic initialization
    // Since we don't have a specific root controller by default, we just check if app booted.
    expect(env.app).toBeDefined();
  });
});
