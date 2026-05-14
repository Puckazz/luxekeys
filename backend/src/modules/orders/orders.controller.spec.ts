import { Test, TestingModule } from '@nestjs/testing';
import {
  OrdersController,
  AdminOrdersController,
} from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { createMockOrder, uuid } from '../../common/testing/index.js';
import { UserRole } from '../../generated/prisma/index.js';

describe('OrdersController', () => {
  let controller: OrdersController;
  let adminController: AdminOrdersController;
  let service: jest.Mocked<OrdersService>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findMyOrders: jest.fn(),
      findAllAdmin: jest.fn(),
      findOne: jest.fn(),
      findOneAdmin: jest.fn(),
      findByCode: jest.fn(),
      cancelOrder: jest.fn(),
      updateOrder: jest.fn(),
      bulkUpdateStatus: jest.fn(),
    } as unknown as jest.Mocked<OrdersService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController, AdminOrdersController],
      providers: [{ provide: OrdersService, useValue: service }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    adminController = module.get<AdminOrdersController>(AdminOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(adminController).toBeDefined();
  });

  describe('OrdersController', () => {
    it('create should delegate to service.create', async () => {
      const order = createMockOrder();
      service.create.mockResolvedValue(order as never);

      const user = { id: order.userId };
      const result = await controller.create(
        user as never,
        { addressId: uuid(), paymentMethod: 'COD' } as never,
      );
      expect(service.create).toHaveBeenCalled();
      expect(result).toBe(order);
    });

    it('findMyOrders should delegate to service.findMyOrders', async () => {
      const paginated = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      service.findMyOrders.mockResolvedValue(paginated as never);

      const user = { id: uuid() };
      const result = await controller.findMyOrders(user as never, {} as never);
      expect(service.findMyOrders).toHaveBeenCalled();
      expect(result).toBe(paginated);
    });

    it('findOne should delegate to service.findOne', async () => {
      const order = createMockOrder();
      service.findOne.mockResolvedValue(order as never);
      const user = { id: order.userId, role: UserRole.CUSTOMER };

      const result = await controller.findOne(user as never, order.id);
      expect(service.findOne).toHaveBeenCalledWith(
        order.id,
        user.id,
        user.role,
      );
      expect(result).toBe(order);
    });

    it('findByCode should delegate to service.findByCode', async () => {
      const order = createMockOrder();
      service.findByCode.mockResolvedValue(order as never);
      const user = { id: order.userId, role: UserRole.CUSTOMER };

      const result = await controller.findByCode(
        user as never,
        order.orderCode,
      );
      expect(service.findByCode).toHaveBeenCalledWith(
        order.orderCode,
        user.id,
        user.role,
      );
      expect(result).toBe(order);
    });

    it('cancel should delegate to service.cancelOrder', async () => {
      const order = createMockOrder();
      service.cancelOrder.mockResolvedValue(order as never);

      const user = { id: order.userId };
      const result = await controller.cancel(user as never, order.id);
      expect(service.cancelOrder).toHaveBeenCalledWith(order.id, user.id);
      expect(result).toBe(order);
    });
  });

  describe('AdminOrdersController', () => {
    it('findAll should delegate to service.findAllAdmin', async () => {
      const paginated = {
        data: { items: [], summary: {} },
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      service.findAllAdmin.mockResolvedValue(paginated as never);

      const result = await adminController.findAll({} as never);
      expect(service.findAllAdmin).toHaveBeenCalled();
      expect(result).toBe(paginated);
    });

    it('findOne should delegate to service.findOneAdmin', async () => {
      const order = createMockOrder();
      service.findOneAdmin.mockResolvedValue(order as never);

      const result = await adminController.findOne(order.id);
      expect(service.findOneAdmin).toHaveBeenCalledWith(order.id);
      expect(result).toBe(order);
    });

    it('update should delegate to service.updateOrder', async () => {
      const order = createMockOrder();
      service.updateOrder.mockResolvedValue(order as never);

      const result = await adminController.update(order.id, {
        status: 'CONFIRMED',
      } as never);
      expect(service.updateOrder).toHaveBeenCalledWith(order.id, {
        status: 'CONFIRMED',
      });
      expect(result).toBe(order);
    });

    it('bulkUpdateStatus should delegate to service.bulkUpdateStatus', async () => {
      const payload = { orderIds: [uuid()], status: 'CONFIRMED' };
      const response = { updatedCount: 1 };
      service.bulkUpdateStatus.mockResolvedValue(response as never);

      const result = await adminController.bulkUpdateStatus(payload as never);
      expect(service.bulkUpdateStatus).toHaveBeenCalledWith(payload);
      expect(result).toBe(response);
    });
  });
});
