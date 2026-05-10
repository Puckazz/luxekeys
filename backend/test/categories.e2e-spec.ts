import { TestEnvironment } from './test-setup.js';
import * as request from 'supertest';
import { UserRole } from '../src/generated/prisma/index.js';

describe('CategoriesModule (e2e)', () => {
  let env: TestEnvironment;
  let adminToken: string;

  beforeAll(async () => {
    env = new TestEnvironment();
    await env.setup();

    // Create an admin user to get a token for protected routes
    const res = await request
      .default(env.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        fullName: 'Admin User',
      });
    adminToken = res.body.data.accessToken;

    // Promote to ADMIN directly in DB
    await env.prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { role: UserRole.ADMIN },
    });
  }, 60000);

  afterAll(async () => {
    await env.teardown();
  });

  afterEach(async () => {
    await env.prisma.category.deleteMany();
  });

  describe('POST /api/categories', () => {
    it('should create a new category (admin)', async () => {
      const payload = {
        name: 'Mechanical Keyboards',
        description: 'Awesome keyboards',
      };

      const response = await request
        .default(env.app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(payload.name);
      expect(response.body.data.slug).toBe('mechanical-keyboards');
    });

    it('should reject if no auth token is provided', async () => {
      await request
        .default(env.app.getHttpServer())
        .post('/api/categories')
        .send({ name: 'Keyboards' })
        .expect(401);
    });
  });

  describe('GET /api/categories', () => {
    it('should return paginated list of categories', async () => {
      // Seed data
      await env.prisma.category.createMany({
        data: [
          { name: 'Cat 1', slug: 'cat-1' },
          { name: 'Cat 2', slug: 'cat-2' },
        ],
      });

      const response = await request
        .default(env.app.getHttpServer())
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });
  });
});
