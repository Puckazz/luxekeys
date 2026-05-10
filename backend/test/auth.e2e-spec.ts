import { TestEnvironment } from './test-setup.js';
import * as request from 'supertest';

describe('AuthModule (e2e)', () => {
  let env: TestEnvironment;

  beforeAll(async () => {
    env = new TestEnvironment();
    await env.setup();
  }, 60000);

  afterAll(async () => {
    await env.teardown();
  });

  afterEach(async () => {
    await env.clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const payload = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      const response = await request
        .default(env.app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user).toMatchObject({
        email: payload.email,
        fullName: payload.fullName,
      });

      // Verify DB
      const user = await env.prisma.user.findUnique({
        where: { email: payload.email },
      });
      expect(user).toBeDefined();
    });

    it('should fail with 409 if email already exists', async () => {
      const payload = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      await request
        .default(env.app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(201);

      const response = await request
        .default(env.app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(409);

      expect(response.body.message).toContain('Email is already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request
        .default(env.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          fullName: 'Login User',
        })
        .expect(201);
    });

    it('should login successfully and return JWT', async () => {
      const response = await request
        .default(env.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'password123' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const response = await request
        .default(env.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});
