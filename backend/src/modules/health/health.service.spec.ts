import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: jest.Mocked<Pick<PrismaService, '$queryRaw'>>;

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
    } as unknown as jest.Mocked<Pick<PrismaService, '$queryRaw'>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should return ok when database ping succeeds', async () => {
    prisma.$queryRaw.mockResolvedValue([{ health_check: 1 }] as never);

    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.environment).toBe('test');
    expect(result.checks.database.status).toBe('ok');
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('should throw service unavailable when database ping fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('database unavailable'));

    await expect(service.check()).rejects.toThrow(ServiceUnavailableException);
  });
});
