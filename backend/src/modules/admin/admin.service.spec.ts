import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  uuid,
} from '../../common/testing/index.js';
import { OrderStatus, ProductType } from '../../generated/prisma/index.js';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-14T12:00:00.000Z'));
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getOverview', () => {
    it('should calculate KPIs from delivered orders only', async () => {
      const userId = uuid();
      prisma.order.findMany
        .mockResolvedValueOnce([
          { id: uuid(), userId, totalAmount: '120.00' },
          { id: uuid(), userId: uuid(), totalAmount: '80.00' },
        ] as never)
        .mockResolvedValueOnce([
          { id: uuid(), userId: uuid(), totalAmount: '100.00' },
        ] as never)
        .mockResolvedValueOnce([
          { status: OrderStatus.DELIVERED },
          { status: OrderStatus.CANCELLED },
          { status: OrderStatus.PENDING },
        ] as never)
        .mockResolvedValueOnce([{ userId }, { userId: uuid() }] as never)
        .mockResolvedValueOnce([{ userId }] as never)
        .mockResolvedValueOnce([] as never);

      const result = await service.getOverview('30d');

      expect(result.period).toBe('30d');
      expect(result.kpis).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: 'orders', value: 2 }),
          expect.objectContaining({ key: 'revenue', value: 200 }),
          expect.objectContaining({ key: 'customers', value: 2 }),
          expect.objectContaining({
            key: 'average-order-value',
            value: 100,
          }),
        ]),
      );
      expect(result.statusBreakdown).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ status: OrderStatus.DELIVERED, value: 1 }),
          expect.objectContaining({ status: OrderStatus.CANCELLED, value: 1 }),
          expect.objectContaining({ status: OrderStatus.PENDING, value: 1 }),
        ]),
      );
    });

    it('should return zero values when there is no data', async () => {
      prisma.order.findMany
        .mockResolvedValueOnce([] as never)
        .mockResolvedValueOnce([] as never)
        .mockResolvedValueOnce([] as never)
        .mockResolvedValueOnce([] as never);

      const result = await service.getOverview('7d');

      expect(result.kpis.every((metric) => metric.value === 0)).toBe(true);
      expect(result.customerMix.every((item) => item.value === 0)).toBe(true);
    });
  });

  describe('getRevenue', () => {
    it('should build the expected number of period buckets', async () => {
      prisma.order.findMany.mockResolvedValue([] as never);

      expect((await service.getRevenue('7d')).points).toHaveLength(7);
      expect((await service.getRevenue('30d')).points).toHaveLength(6);
      expect((await service.getRevenue('90d')).points).toHaveLength(9);
    });

    it('should bucket delivered revenue and orders', async () => {
      prisma.order.findMany.mockResolvedValue([
        {
          placedAt: new Date('2026-05-13T12:00:00.000Z'),
          totalAmount: '50.00',
        },
        {
          placedAt: new Date('2026-05-13T13:00:00.000Z'),
          totalAmount: '75.00',
        },
      ] as never);

      const result = await service.getRevenue('7d');
      const revenueTotal = result.points.reduce(
        (total, point) => total + point.revenue,
        0,
      );
      const orderTotal = result.points.reduce(
        (total, point) => total + point.orders,
        0,
      );

      expect(revenueTotal).toBe(125);
      expect(orderTotal).toBe(2);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: OrderStatus.DELIVERED }),
        }),
      );
    });
  });

  describe('getTopProducts', () => {
    it('should aggregate product units and revenue from delivered order items', async () => {
      const productId = uuid();
      prisma.orderItem.findMany.mockResolvedValue([
        {
          productId,
          productName: 'Keychron K2',
          quantity: 2,
          subtotalAmount: '200.00',
          product: {
            type: ProductType.KEYBOARD,
            category: { name: 'Keyboards' },
          },
        },
        {
          productId,
          productName: 'Keychron K2',
          quantity: 1,
          subtotalAmount: '100.00',
          product: {
            type: ProductType.KEYBOARD,
            category: { name: 'Keyboards' },
          },
        },
      ] as never);

      const result = await service.getTopProducts('30d', 4);

      expect(result.items).toEqual([
        {
          id: productId,
          name: 'Keychron K2',
          category: 'Keyboards',
          unitsSold: 3,
          revenue: 300,
          unitPrice: 100,
        },
      ]);
    });
  });
});
