import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { PrismaService } from '../src/modules/database/prisma.service.js';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor.js';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter.js';
import cookieParser from 'cookie-parser';

export class TestEnvironment {
  public app: INestApplication;
  public pgContainer: StartedPostgreSqlContainer;
  public prisma: PrismaService;

  async setup() {
    // 1. Start PostgreSQL Container
    this.pgContainer = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('testdb')
      .withUsername('testuser')
      .withPassword('testpass')
      .start();

    const databaseUrl = this.pgContainer.getConnectionUri();
    process.env.DATABASE_URL = databaseUrl;
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    // 2. Run migrations
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'ignore',
    });

    // 3. Setup NestJS App
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication({ logger: false });

    // Apply global middlewares/pipes as in main.ts
    this.app.setGlobalPrefix('api', {
      exclude: [{ path: 'healthz', method: RequestMethod.GET }],
    });
    this.app.use(cookieParser());
    this.app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    this.app.useGlobalInterceptors(new TransformResponseInterceptor());
    this.app.useGlobalFilters(new GlobalExceptionFilter());

    await this.app.init();

    this.prisma = this.app.get(PrismaService);
  }

  async teardown() {
    if (this.app) {
      await this.app.close();
    }
    if (this.pgContainer) {
      await this.pgContainer.stop();
    }
  }

  async clearDatabase() {
    // Clean tables between tests
    const tableNames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tableNames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    if (tables.length > 0) {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  }
}
