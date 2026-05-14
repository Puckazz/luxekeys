import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '../../generated/prisma/index.js';
import { PrismaService } from '../database/prisma.service.js';
import type { AdminStatsPeriod } from './dto/admin-stats-query.dto.js';
import type {
  AdminStatsOverview,
  AdminStatsRevenue,
  AdminStatsRevenuePoint,
  AdminStatsTopProducts,
} from './interfaces/admin-stats.interface.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultPeriod: AdminStatsPeriod = '30d';

  private readonly statusLabels: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SHIPPING: 'Shipping',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };

  private resolvePeriod(period?: AdminStatsPeriod): AdminStatsPeriod {
    return period ?? this.defaultPeriod;
  }

  private getPeriodDays(period: AdminStatsPeriod): number {
    if (period === '7d') {
      return 7;
    }

    if (period === '90d') {
      return 90;
    }

    return 30;
  }

  private getBucketCount(period: AdminStatsPeriod): number {
    if (period === '7d') {
      return 7;
    }

    if (period === '90d') {
      return 9;
    }

    return 6;
  }

  private getPeriodRange(period: AdminStatsPeriod) {
    const currentRangeEnd = new Date();
    const periodMs = this.getPeriodDays(period) * 86_400_000;
    const currentRangeStart = new Date(currentRangeEnd.getTime() - periodMs);
    const previousRangeStart = new Date(currentRangeStart.getTime() - periodMs);
    const previousRangeEnd = currentRangeStart;

    return {
      currentRangeStart,
      currentRangeEnd,
      previousRangeStart,
      previousRangeEnd,
    };
  }

  private getCurrentPeriodWhere(
    period: AdminStatsPeriod,
  ): Prisma.OrderWhereInput {
    const range = this.getPeriodRange(period);

    return {
      placedAt: {
        gte: range.currentRangeStart,
        lte: range.currentRangeEnd,
      },
    };
  }

  private getDeliveredWhere(period: AdminStatsPeriod): Prisma.OrderWhereInput {
    return {
      ...this.getCurrentPeriodWhere(period),
      status: OrderStatus.DELIVERED,
    };
  }

  private getPreviousDeliveredWhere(
    period: AdminStatsPeriod,
  ): Prisma.OrderWhereInput {
    const range = this.getPeriodRange(period);

    return {
      status: OrderStatus.DELIVERED,
      placedAt: {
        gte: range.previousRangeStart,
        lt: range.previousRangeEnd,
      },
    };
  }

  private getChangePercent(current: number, previous: number): number {
    if (previous <= 0) {
      return 0;
    }

    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private sumOrderRevenue(
    orders: Array<{ totalAmount: Prisma.Decimal | string | number }>,
  ): number {
    return orders.reduce((total, order) => {
      return total + Number(order.totalAmount);
    }, 0);
  }

  private getUniqueUserCount(orders: Array<{ userId: string }>): number {
    return new Set(orders.map((order) => order.userId)).size;
  }

  private getEmptyCustomerMix(): AdminStatsOverview['customerMix'] {
    return [
      { key: 'new', label: 'New customers', value: 0 },
      { key: 'returning', label: 'Returning customers', value: 0 },
      { key: 'reactivated', label: 'Reactivated customers', value: 0 },
    ];
  }

  private async getCustomerMix(
    period: AdminStatsPeriod,
  ): Promise<AdminStatsOverview['customerMix']> {
    const range = this.getPeriodRange(period);
    const currentOrders = await this.prisma.order.findMany({
      where: this.getDeliveredWhere(period),
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });
    const userIds = currentOrders.map((order) => order.userId);

    if (userIds.length === 0) {
      return this.getEmptyCustomerMix();
    }

    const [historicalOrders, previousPeriodOrders] =
      await this.prisma.$transaction([
        this.prisma.order.findMany({
          where: {
            userId: { in: userIds },
            status: OrderStatus.DELIVERED,
            placedAt: {
              lt: range.currentRangeStart,
            },
          },
          select: {
            userId: true,
          },
          distinct: ['userId'],
        }),
        this.prisma.order.findMany({
          where: {
            userId: { in: userIds },
            status: OrderStatus.DELIVERED,
            placedAt: {
              gte: range.previousRangeStart,
              lt: range.previousRangeEnd,
            },
          },
          select: {
            userId: true,
          },
          distinct: ['userId'],
        }),
      ]);

    const historicalUserIds = new Set(
      historicalOrders.map((order) => order.userId),
    );
    const previousPeriodUserIds = new Set(
      previousPeriodOrders.map((order) => order.userId),
    );
    const newCustomers = userIds.filter(
      (userId) => !historicalUserIds.has(userId),
    ).length;
    const reactivatedCustomers = userIds.filter((userId) => {
      return (
        historicalUserIds.has(userId) && !previousPeriodUserIds.has(userId)
      );
    }).length;
    const returningCustomers = Math.max(
      0,
      userIds.length - newCustomers - reactivatedCustomers,
    );

    return [
      { key: 'new', label: 'New customers', value: newCustomers },
      {
        key: 'returning',
        label: 'Returning customers',
        value: returningCustomers,
      },
      {
        key: 'reactivated',
        label: 'Reactivated customers',
        value: reactivatedCustomers,
      },
    ];
  }

  async getOverview(
    periodInput?: AdminStatsPeriod,
  ): Promise<AdminStatsOverview> {
    const period = this.resolvePeriod(periodInput);
    const [currentDeliveredOrders, previousDeliveredOrders, statusOrders] =
      await this.prisma.$transaction([
        this.prisma.order.findMany({
          where: this.getDeliveredWhere(period),
          select: {
            id: true,
            userId: true,
            totalAmount: true,
          },
        }),
        this.prisma.order.findMany({
          where: this.getPreviousDeliveredWhere(period),
          select: {
            id: true,
            userId: true,
            totalAmount: true,
          },
        }),
        this.prisma.order.findMany({
          where: this.getCurrentPeriodWhere(period),
          select: {
            status: true,
          },
        }),
      ]);

    const currentRevenue = this.sumOrderRevenue(currentDeliveredOrders);
    const previousRevenue = this.sumOrderRevenue(previousDeliveredOrders);
    const currentOrders = currentDeliveredOrders.length;
    const previousOrders = previousDeliveredOrders.length;
    const currentCustomers = this.getUniqueUserCount(currentDeliveredOrders);
    const previousCustomers = this.getUniqueUserCount(previousDeliveredOrders);
    const currentAverageOrderValue =
      currentOrders > 0 ? currentRevenue / currentOrders : 0;
    const previousAverageOrderValue =
      previousOrders > 0 ? previousRevenue / previousOrders : 0;
    const statusBreakdown = Object.values(OrderStatus).map((status) => ({
      status,
      label: this.statusLabels[status],
      value: statusOrders.filter((order) => order.status === status).length,
    }));
    const customerMix = await this.getCustomerMix(period);

    return {
      period,
      kpis: [
        {
          key: 'orders',
          label: 'Orders completed',
          value: currentOrders,
          previousValue: previousOrders,
          changePercent: this.getChangePercent(currentOrders, previousOrders),
        },
        {
          key: 'revenue',
          label: 'Total revenue',
          value: currentRevenue,
          previousValue: previousRevenue,
          changePercent: this.getChangePercent(currentRevenue, previousRevenue),
        },
        {
          key: 'customers',
          label: 'Active customers',
          value: currentCustomers,
          previousValue: previousCustomers,
          changePercent: this.getChangePercent(
            currentCustomers,
            previousCustomers,
          ),
        },
        {
          key: 'average-order-value',
          label: 'Average order value',
          value: currentAverageOrderValue,
          previousValue: previousAverageOrderValue,
          changePercent: this.getChangePercent(
            currentAverageOrderValue,
            previousAverageOrderValue,
          ),
        },
      ],
      statusBreakdown,
      customerMix,
    };
  }

  async getRevenue(periodInput?: AdminStatsPeriod): Promise<AdminStatsRevenue> {
    const period = this.resolvePeriod(periodInput);
    const range = this.getPeriodRange(period);
    const bucketCount = this.getBucketCount(period);
    const bucketWidth = Math.max(
      1,
      Math.floor(
        (range.currentRangeEnd.getTime() - range.currentRangeStart.getTime()) /
          bucketCount,
      ),
    );
    const deliveredOrders = await this.prisma.order.findMany({
      where: this.getDeliveredWhere(period),
      select: {
        placedAt: true,
        totalAmount: true,
      },
    });
    const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const points: AdminStatsRevenuePoint[] = Array.from(
      { length: bucketCount },
      (_, index) => {
        const start = new Date(
          range.currentRangeStart.getTime() + bucketWidth * index,
        );
        const end =
          index === bucketCount - 1
            ? new Date(range.currentRangeEnd.getTime() + 1)
            : new Date(start.getTime() + bucketWidth);
        const bucketOrders = deliveredOrders.filter((order) => {
          const placedAt = order.placedAt.getTime();
          return placedAt >= start.getTime() && placedAt < end.getTime();
        });

        return {
          label: shortDateFormatter.format(start),
          revenue: this.sumOrderRevenue(bucketOrders),
          orders: bucketOrders.length,
        };
      },
    );

    return {
      period,
      points,
    };
  }

  async getTopProducts(
    periodInput?: AdminStatsPeriod,
    limit = 4,
  ): Promise<AdminStatsTopProducts> {
    const period = this.resolvePeriod(periodInput);
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: this.getDeliveredWhere(period),
      },
      select: {
        productId: true,
        productName: true,
        quantity: true,
        subtotalAmount: true,
        product: {
          select: {
            type: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    const products = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        unitsSold: number;
        revenue: number;
      }
    >();

    orderItems.forEach((item) => {
      const current = products.get(item.productId) ?? {
        id: item.productId,
        name: item.productName,
        category: item.product.category?.name ?? item.product.type,
        unitsSold: 0,
        revenue: 0,
      };

      current.unitsSold += item.quantity;
      current.revenue += Number(item.subtotalAmount);
      products.set(item.productId, current);
    });

    return {
      period,
      items: Array.from(products.values())
        .map((product) => ({
          ...product,
          unitPrice:
            product.unitsSold > 0 ? product.revenue / product.unitsSold : 0,
        }))
        .sort((left, right) => right.revenue - left.revenue)
        .slice(0, limit),
    };
  }
}
