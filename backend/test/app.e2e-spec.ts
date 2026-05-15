import { TestEnvironment } from './test-setup.js';
import * as request from 'supertest';

describe('Health (e2e)', () => {
  let env: TestEnvironment;

  beforeAll(async () => {
    env = new TestEnvironment();
    await env.setup();
  }, 60000); // 60s timeout for downloading postgres image

  afterAll(async () => {
    await env.teardown();
  });

  it('/healthz (GET)', async () => {
    const response = await request
      .default(env.app.getHttpServer())
      .get('/healthz')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.checks.database.status).toBe('ok');
  });
});
