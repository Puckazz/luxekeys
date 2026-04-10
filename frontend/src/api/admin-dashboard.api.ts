import { adminOrdersApi } from '@/api/admin-orders.api';
import { adminProductsApi } from '@/api/admin-products.api';
import type {
  AdminDashboardPeriod,
  AdminDashboardSummary,
  AdminDashboardTopProduct,
} from '@/features/admin/types/admin-dashboard.types';
import { formatCurrency } from '@/lib/formatters';

const ORDER_QUERY_ALL = {
  search: '',
  status: 'all' as const,
  sort: 'oldest' as const,
  page: 1,
  pageSize: 120,
};

const PRODUCT_QUERY_ALL = {
  search: '',
  category: 'all' as const,
  status: 'all' as const,
  sort: 'newest' as const,
  page: 1,
  pageSize: 120,
};

const numberFormatter = new Intl.NumberFormat('en-US');

const periodToDays = (period: AdminDashboardPeriod) => {
  if (period === '7d') {
    return 7;
  }

  if (period === '30d') {
    return 30;
  }

  return 90;
};

const periodToBucketCount = (period: AdminDashboardPeriod) => {
  if (period === '7d') {
    return 7;
  }

  if (period === '30d') {
    return 6;
  }

  return 9;
};

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const compactNumber = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }

  return numberFormatter.format(value);
};

const toPercentChangeLabel = (current: number, previous: number) => {
  if (previous <= 0) {
    return '+0% vs previous period';
  }

  const ratio = ((current - previous) / previous) * 100;
  const signal = ratio >= 0 ? '+' : '';

  return `${signal}${ratio.toFixed(1)}% vs previous period`;
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const getPeriodRange = (period: AdminDashboardPeriod) => {
  const now = new Date();
  const currentRangeEnd = now.getTime();
  const currentRangeStart = currentRangeEnd - periodToDays(period) * 86_400_000;

  return {
    currentRangeStart,
    currentRangeEnd,
    previousRangeStart: currentRangeStart - periodToDays(period) * 86_400_000,
    previousRangeEnd: currentRangeStart,
  };
};

const buildTopProducts = (
  products: Awaited<ReturnType<typeof adminProductsApi.getProducts>>['items'],
  period: AdminDashboardPeriod
): AdminDashboardTopProduct[] => {
  const multiplier = period === '7d' ? 1 : period === '30d' ? 1.8 : 2.6;

  return products
    .map((product) => {
      const cheapestVariant = product.variants.reduce((best, variant) => {
        return variant.price < best.price ? variant : best;
      }, product.variants[0]);
      const hash = hashString(`${product.id}-${period}`);
      const unitsSold = Math.max(
        8,
        Math.round(((hash % 45) + 12) * multiplier)
      );
      const unitPrice = cheapestVariant.price;

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        unitPrice,
        unitsSold,
        revenue: unitPrice * unitsSold,
      };
    })
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 4);
};

export const adminDashboardApi = {
  getDashboardSummary: async (
    period: AdminDashboardPeriod
  ): Promise<AdminDashboardSummary> => {
    const [ordersResponse, productsResponse] = await Promise.all([
      adminOrdersApi.getOrders(ORDER_QUERY_ALL),
      adminProductsApi.getProducts(PRODUCT_QUERY_ALL),
    ]);

    const range = getPeriodRange(period);

    const currentOrders = ordersResponse.items.filter((order) => {
      const createdAt = new Date(order.createdAt).getTime();
      return (
        createdAt >= range.currentRangeStart &&
        createdAt <= range.currentRangeEnd
      );
    });

    const previousOrders = ordersResponse.items.filter((order) => {
      const createdAt = new Date(order.createdAt).getTime();
      return (
        createdAt >= range.previousRangeStart &&
        createdAt < range.previousRangeEnd
      );
    });

    const currentRevenue = currentOrders.reduce((total, order) => {
      return total + order.total;
    }, 0);
    const previousRevenue = previousOrders.reduce((total, order) => {
      return total + order.total;
    }, 0);

    const currentOrdersCount = currentOrders.length;
    const previousOrdersCount = previousOrders.length;

    const currentCustomers = new Set(
      currentOrders.map((order) => order.customer.email)
    ).size;
    const previousCustomers = new Set(
      previousOrders.map((order) => order.customer.email)
    ).size;

    const visitsTotal = Math.round(
      currentOrdersCount * 140 + currentCustomers * 45 + 2_900
    );

    const bucketCount = periodToBucketCount(period);
    const rangeWidth = range.currentRangeEnd - range.currentRangeStart;
    const bucketWidth = Math.max(1, Math.floor(rangeWidth / bucketCount));

    const revenueTrend = Array.from({ length: bucketCount }, (_, index) => {
      const start = range.currentRangeStart + bucketWidth * index;
      const end =
        index === bucketCount - 1
          ? range.currentRangeEnd + 1
          : start + bucketWidth;

      const bucketOrders = currentOrders.filter((order) => {
        const createdAt = new Date(order.createdAt).getTime();
        return createdAt >= start && createdAt < end;
      });

      const revenue = bucketOrders.reduce(
        (total, order) => total + order.total,
        0
      );
      const orders = bucketOrders.length;

      return {
        label: shortDateFormatter.format(new Date(start)),
        revenue,
        orders,
      };
    });

    const topProducts = buildTopProducts(productsResponse.items, period);
    const topProductRevenue = topProducts.reduce(
      (total, item) => total + item.revenue,
      0
    );

    const womenVisits = Math.round(visitsTotal * 0.58);
    const menVisits = Math.round(visitsTotal * 0.42);

    const delivered = ordersResponse.summary.delivered;
    const repeatCustomers = Math.max(0, delivered - currentCustomers);
    const newCustomers = Math.max(
      1,
      currentCustomers - Math.round(repeatCustomers * 0.45)
    );
    const reactivatedCustomers = Math.max(
      1,
      Math.round(currentCustomers * 0.18)
    );

    return {
      period,
      kpis: [
        {
          key: 'orders',
          label: 'Orders completed',
          value: compactNumber(currentOrdersCount),
          changeLabel: toPercentChangeLabel(
            currentOrdersCount,
            previousOrdersCount
          ),
        },
        {
          key: 'revenue',
          label: 'Total revenue',
          value: formatCurrency(currentRevenue, { maximumFractionDigits: 0 }),
          changeLabel: toPercentChangeLabel(currentRevenue, previousRevenue),
        },
        {
          key: 'customers',
          label: 'Active customers',
          value: compactNumber(currentCustomers),
          changeLabel: toPercentChangeLabel(
            currentCustomers,
            previousCustomers
          ),
        },
        {
          key: 'store-visits',
          label: 'Store visits',
          value: compactNumber(visitsTotal),
          changeLabel: '+6.4% vs previous period',
        },
      ],
      revenueTrend,
      visitsTotal,
      visitsSegments: [
        {
          label: 'Men',
          value: menVisits,
          trendLabel: `${Math.round((menVisits / visitsTotal) * 100)}%`,
        },
        {
          label: 'Women',
          value: womenVisits,
          trendLabel: `${Math.round((womenVisits / visitsTotal) * 100)}%`,
        },
        {
          label: 'Top products share',
          value: Math.round(
            (topProductRevenue / Math.max(1, currentRevenue)) * 100
          ),
          trendLabel: 'Revenue contribution',
        },
      ],
      topProducts,
      statusBreakdown: [
        {
          status: 'pending',
          label: 'Pending',
          value: ordersResponse.summary.pending,
        },
        {
          status: 'confirmed',
          label: 'Confirmed',
          value: ordersResponse.summary.confirmed,
        },
        {
          status: 'shipped',
          label: 'Shipped',
          value: ordersResponse.summary.shipped,
        },
        {
          status: 'delivered',
          label: 'Delivered',
          value: ordersResponse.summary.delivered,
        },
        {
          status: 'cancelled',
          label: 'Cancelled',
          value: ordersResponse.summary.cancelled,
        },
      ],
      customerMix: [
        {
          key: 'new',
          label: 'New customers',
          value: newCustomers,
          colorToken: '--chart-1',
        },
        {
          key: 'returning',
          label: 'Returning customers',
          value: repeatCustomers,
          colorToken: '--chart-2',
        },
        {
          key: 'reactivated',
          label: 'Reactivated customers',
          value: reactivatedCustomers,
          colorToken: '--chart-5',
        },
      ],
    };
  },
};
