import type {
  AdminDashboardAverageOrderValueMetric,
  AdminDashboardCustomerMixItem,
  AdminDashboardKpiMetric,
  AdminDashboardPeriod,
  AdminDashboardRevenuePoint,
  AdminDashboardStatusBreakdownItem,
  AdminDashboardSummary,
  AdminDashboardTopProduct,
} from '@/features/admin/types/admin-dashboard.types';
import { formatCurrency } from '@/lib/formatters';
import { authFetch } from '@/shared/api/http-client';

type AdminDashboardApiKpiKey =
  | 'orders'
  | 'revenue'
  | 'customers'
  | 'average-order-value';

type AdminDashboardApiOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

type AdminDashboardOverviewApiResponse = {
  period: AdminDashboardPeriod;
  kpis: {
    key: AdminDashboardApiKpiKey;
    label: string;
    value: number;
    previousValue: number;
    changePercent: number;
  }[];
  statusBreakdown: {
    status: AdminDashboardApiOrderStatus;
    label: string;
    value: number;
  }[];
  customerMix: {
    key: 'new' | 'returning' | 'reactivated';
    label: string;
    value: number;
  }[];
};

type AdminDashboardRevenueApiResponse = {
  period: AdminDashboardPeriod;
  points: AdminDashboardRevenuePoint[];
};

type AdminDashboardTopProductsApiResponse = {
  period: AdminDashboardPeriod;
  items: AdminDashboardTopProduct[];
};

const numberFormatter = new Intl.NumberFormat('en-US');

const colorTokenByCustomerMixKey: Record<
  AdminDashboardCustomerMixItem['key'],
  AdminDashboardCustomerMixItem['colorToken']
> = {
  new: '--chart-1',
  returning: '--chart-2',
  reactivated: '--chart-5',
};

const apiStatusToDashboardStatus: Record<
  AdminDashboardApiOrderStatus,
  AdminDashboardStatusBreakdownItem['status']
> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const toQueryString = (
  params: Record<string, string | number | undefined>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

const compactNumber = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }

  return numberFormatter.format(value);
};

const toChangeLabel = (changePercent: number) => {
  const signal = changePercent >= 0 ? '+' : '';
  return `${signal}${changePercent.toFixed(1)}% vs previous period`;
};

const formatKpiValue = (
  key: AdminDashboardApiKpiKey,
  value: number
): string => {
  if (key === 'revenue' || key === 'average-order-value') {
    return formatCurrency(value, { maximumFractionDigits: 0 });
  }

  return compactNumber(value);
};

const mapKpi = (
  metric: AdminDashboardOverviewApiResponse['kpis'][number]
): AdminDashboardKpiMetric => {
  return {
    key: metric.key,
    label: metric.label,
    value: formatKpiValue(metric.key, metric.value),
    changeLabel: toChangeLabel(metric.changePercent),
    rawValue: metric.value,
    previousRawValue: metric.previousValue,
    changePercent: metric.changePercent,
  };
};

const mapAverageOrderValue = (
  metrics: AdminDashboardKpiMetric[]
): AdminDashboardAverageOrderValueMetric => {
  const metric = metrics.find((item) => item.key === 'average-order-value');

  return {
    label: metric?.label ?? 'Average order value',
    value: metric?.value ?? formatCurrency(0, { maximumFractionDigits: 0 }),
    previousValue: formatCurrency(metric?.previousRawValue ?? 0, {
      maximumFractionDigits: 0,
    }),
    changeLabel: metric?.changeLabel ?? '+0.0% vs previous period',
  };
};

const mapStatusBreakdown = (
  items: AdminDashboardOverviewApiResponse['statusBreakdown']
): AdminDashboardStatusBreakdownItem[] => {
  return items.map((item) => ({
    status: apiStatusToDashboardStatus[item.status],
    label: item.label,
    value: item.value,
  }));
};

const mapCustomerMix = (
  items: AdminDashboardOverviewApiResponse['customerMix']
): AdminDashboardCustomerMixItem[] => {
  return items.map((item) => ({
    ...item,
    colorToken: colorTokenByCustomerMixKey[item.key],
  }));
};

export const adminDashboardApi = {
  getDashboardSummary: async (
    period: AdminDashboardPeriod
  ): Promise<AdminDashboardSummary> => {
    const query = toQueryString({ period });
    const [overview, revenue, topProducts] = await Promise.all([
      authFetch<AdminDashboardOverviewApiResponse>(
        `/admin/stats/overview?${query}`
      ),
      authFetch<AdminDashboardRevenueApiResponse>(
        `/admin/stats/revenue?${query}`
      ),
      authFetch<AdminDashboardTopProductsApiResponse>(
        `/admin/stats/top-products?${toQueryString({ period, limit: 4 })}`
      ),
    ]);
    const kpis = overview.kpis.map(mapKpi);

    return {
      period: overview.period,
      kpis,
      revenueTrend: revenue.points,
      averageOrderValue: mapAverageOrderValue(kpis),
      topProducts: topProducts.items,
      statusBreakdown: mapStatusBreakdown(overview.statusBreakdown),
      customerMix: mapCustomerMix(overview.customerMix),
    };
  },
};
