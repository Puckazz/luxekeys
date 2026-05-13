import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockOrder,
  createMockAddress,
  createMockVariant,
  createMockProduct,
  uuid,
} from '../../common/testing/index.js';
import { OrderStatus, UserRole } from '../../generated/prisma/index.js';

const buildCart = (userId: string, items: unknown[] = []) => ({
  id: uuid(),
  userId,
  items,
});

const buildCartItem = (
  variantId: string,
  quantity = 1,
  price = '99.00',
  stock = 100,
) => ({
  id: uuid(),
  cartId: uuid(),
  variantId,
  switchOptionId: null,
  quantity,
  variant: {
    ...createMockVariant({ id: variantId, price, stock, isActive: true }),
    product: createMockProduct(),
  },
});

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return an order when found', async () => {
      const order = { ...createMockOrder(), address: null, items: [] };
      prisma.order.findFirst.mockResolvedValue(order as never);

      const result = await service.findOne(
        order.id,
        order.userId,
        UserRole.CUSTOMER,
      );
      expect(result.id).toBe(order.id);
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findFirst.mockResolvedValue(null);
      await expect(
        service.findOne(uuid(), uuid(), UserRole.CUSTOMER),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when requester does not own the order', async () => {
      const order = { ...createMockOrder(), address: null, items: [] };
      prisma.order.findFirst.mockResolvedValue(order as never);

      await expect(
        service.findOne(order.id, uuid(), UserRole.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── findByCode ─────────────────────────────────────────────────────────────

  describe('findByCode', () => {
    it('should return an order by orderCode', async () => {
      const order = { ...createMockOrder(), address: null, items: [] };
      prisma.order.findFirst.mockResolvedValue(order as never);

      const result = await service.findByCode(
        order.orderCode,
        order.userId,
        UserRole.CUSTOMER,
      );
      expect(result.orderCode).toBe(order.orderCode);
    });

    it('should throw NotFoundException when code not found', async () => {
      prisma.order.findFirst.mockResolvedValue(null);
      await expect(
        service.findByCode('INVALID-CODE', uuid(), UserRole.CUSTOMER),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findMyOrders ────────────────────────────────────────────────────────────

  describe('findMyOrders', () => {
    it('should return paginated orders for the user', async () => {
      const userId = uuid();
      const orders = [
        { ...createMockOrder({ userId }), address: null, items: [] },
      ];
      prisma.$transaction.mockResolvedValue([1, orders] as never);

      const result = await service.findMyOrders(userId, {} as never);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create order, decrement stock, and clear cart', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      const variantId = uuid();
      const cartItem = buildCartItem(variantId);
      const cart = buildCart(userId, [cartItem]);
      const order = { ...createMockOrder({ userId }), address, items: [] };

      prisma.address.findFirst.mockResolvedValue(address as never);
      prisma.cart.findUnique.mockResolvedValue(cart as never);

      prisma.$transaction.mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<unknown>) => {
          prisma.order.create.mockResolvedValue(order as never);
          prisma.productVariant.updateMany.mockResolvedValue({
            count: 1,
          } as never);
          prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 } as never);
          return fn(prisma as never);
        },
      );

      const result = await service.create(userId, {
        addressId: address.id,
        paymentMethod: 'PAYPAL',
      } as never);

      expect(result).toHaveProperty('id');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should snapshot switch option price when creating order items', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      const variantId = uuid();
      const switchOptionId = uuid();
      const cartItem = {
        ...buildCartItem(variantId, 2, '99.00', 10),
        switchOptionId,
        switchOption: {
          id: switchOptionId,
          variantId,
          name: 'Oil King',
          switchType: 'Linear',
          price: '125.00',
          compareAtPrice: null,
          stock: 10,
          isDefault: true,
          sortOrder: 0,
          isActive: true,
          deletedAt: null,
          createdAt: new Date(),
        },
      };
      const cart = buildCart(userId, [cartItem]);
      const order = { ...createMockOrder({ userId }), address, items: [] };

      prisma.address.findFirst.mockResolvedValue(address as never);
      prisma.cart.findUnique.mockResolvedValue(cart as never);

      prisma.$transaction.mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<unknown>) => {
          prisma.order.create.mockResolvedValue(order as never);
          prisma.productVariant.updateMany.mockResolvedValue({
            count: 1,
          } as never);
          prisma.productSwitchOption.updateMany.mockResolvedValue({
            count: 1,
          } as never);
          prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 } as never);
          return fn(prisma as never);
        },
      );

      await service.create(userId, {
        addressId: address.id,
        paymentMethod: 'PAYPAL',
      } as never);

      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotalAmount: 250,
            totalAmount: 250,
            items: {
              create: [
                expect.objectContaining({
                  unitPrice: 125,
                  subtotalAmount: 250,
                }),
              ],
            },
          }),
        }),
      );
    });

    it('should throw NotFoundException when address not found', async () => {
      prisma.address.findFirst.mockResolvedValue(null);

      await expect(
        service.create(uuid(), {
          addressId: uuid(),
          paymentMethod: 'PAYPAL',
        } as never),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when cart is empty', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      prisma.address.findFirst.mockResolvedValue(address as never);
      prisma.cart.findUnique.mockResolvedValue(buildCart(userId, []) as never);

      await expect(
        service.create(userId, {
          addressId: address.id,
          paymentMethod: 'PAYPAL',
        } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when a variant is inactive', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      const cartItem = {
        ...buildCartItem(uuid()),
        variant: { ...buildCartItem(uuid()).variant, isActive: false },
      };
      prisma.address.findFirst.mockResolvedValue(address as never);
      prisma.cart.findUnique.mockResolvedValue(
        buildCart(userId, [cartItem]) as never,
      );
      prisma.productVariant.updateMany.mockResolvedValue({ count: 0 } as never);

      await expect(
        service.create(userId, {
          addressId: address.id,
          paymentMethod: 'PAYPAL',
        } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      const cartItem = buildCartItem(uuid(), 99, '99.00', 5); // quantity 99 > stock 5
      prisma.address.findFirst.mockResolvedValue(address as never);
      prisma.cart.findUnique.mockResolvedValue(
        buildCart(userId, [cartItem]) as never,
      );
      prisma.productVariant.updateMany.mockResolvedValue({ count: 0 } as never);

      await expect(
        service.create(userId, {
          addressId: address.id,
          paymentMethod: 'PAYPAL',
        } as never),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── cancelOrder ────────────────────────────────────────────────────────────

  describe('cancelOrder', () => {
    it('should cancel a PENDING order and restore stock', async () => {
      const userId = uuid();
      const variantId = uuid();
      const item = { id: uuid(), orderId: uuid(), variantId, quantity: 2 };
      const order = {
        ...createMockOrder({ userId, status: OrderStatus.PENDING }),
        address: null,
        items: [item],
      };
      const cancelled = { ...order, status: OrderStatus.CANCELLED };

      prisma.order.findFirst.mockResolvedValue(order as never);
      prisma.$transaction.mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<unknown>) => {
          prisma.order.update.mockResolvedValue(cancelled as never);
          prisma.productVariant.update.mockResolvedValue(
            createMockVariant() as never,
          );
          return fn(prisma as never);
        },
      );

      const result = await service.cancelOrder(order.id, userId);
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findFirst.mockResolvedValue(null);
      await expect(service.cancelOrder(uuid(), uuid())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own the order', async () => {
      const order = {
        ...createMockOrder({ userId: uuid() }),
        address: null,
        items: [],
      };
      prisma.order.findFirst.mockResolvedValue(order as never);

      await expect(service.cancelOrder(order.id, uuid())).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when order is already SHIPPING', async () => {
      const userId = uuid();
      const order = {
        ...createMockOrder({ userId, status: OrderStatus.SHIPPING }),
        address: null,
        items: [],
      };
      prisma.order.findFirst.mockResolvedValue(order as never);

      await expect(service.cancelOrder(order.id, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── updateStatus ────────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const order = { ...createMockOrder(), address: null, items: [] };
      const updated = { ...order, status: OrderStatus.CONFIRMED };

      prisma.order.findFirst.mockResolvedValue(order as never);
      prisma.order.update.mockResolvedValue(updated as never);

      const result = await service.updateStatus(order.id, {
        status: OrderStatus.CONFIRMED,
      } as never);
      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findFirst.mockResolvedValue(null);
      await expect(service.updateStatus(uuid(), {} as never)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
