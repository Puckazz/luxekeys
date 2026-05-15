import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { ROLES_KEY } from '../../common/decorators/index.js';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/index.js';
import { UserRole } from '../../generated/prisma/index.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<AdminService>;

  beforeEach(async () => {
    service = {
      getOverview: jest.fn(),
      getRevenue: jest.fn(),
      getTopProducts: jest.fn(),
    } as unknown as jest.Mocked<AdminService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: service }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should require admin auth guards and role', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, AdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.OWNER, UserRole.ADMIN]);
  });

  it('getOverview should delegate to service.getOverview', async () => {
    const overview = { period: '30d', kpis: [] };
    service.getOverview.mockResolvedValue(overview as never);

    const result = await controller.getOverview({ period: '30d' });

    expect(service.getOverview).toHaveBeenCalledWith('30d');
    expect(result).toBe(overview);
  });

  it('getRevenue should delegate to service.getRevenue', async () => {
    const revenue = { period: '7d', points: [] };
    service.getRevenue.mockResolvedValue(revenue as never);

    const result = await controller.getRevenue({ period: '7d' });

    expect(service.getRevenue).toHaveBeenCalledWith('7d');
    expect(result).toBe(revenue);
  });

  it('getTopProducts should delegate to service.getTopProducts', async () => {
    const topProducts = { period: '90d', items: [] };
    service.getTopProducts.mockResolvedValue(topProducts as never);

    const result = await controller.getTopProducts({ period: '90d', limit: 4 });

    expect(service.getTopProducts).toHaveBeenCalledWith('90d', 4);
    expect(result).toBe(topProducts);
  });
});
