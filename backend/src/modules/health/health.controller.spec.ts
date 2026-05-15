import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import type { HealthCheckResponse } from './interfaces/health.interface';

describe('HealthController', () => {
  let controller: HealthController;
  let service: jest.Mocked<HealthService>;

  beforeEach(async () => {
    service = {
      check: jest.fn(),
    } as unknown as jest.Mocked<HealthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: service }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('check should delegate to service.check', async () => {
    const health: HealthCheckResponse = {
      status: 'ok',
      service: 'luxekeys-api',
      environment: 'test',
      timestamp: new Date().toISOString(),
      uptimeSeconds: 1,
      checks: {
        database: {
          status: 'ok',
          latencyMs: 1,
        },
      },
    };
    service.check.mockResolvedValue(health);

    const result = await controller.check();

    expect(service.check).toHaveBeenCalledWith();
    expect(result).toBe(health);
  });
});
