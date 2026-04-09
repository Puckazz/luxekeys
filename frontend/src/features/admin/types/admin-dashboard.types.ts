import type { OrderStatus } from '@/features/profile/types';

export const ADMIN_DASHBOARD_PERIOD_OPTIONS = ['7d', '30d', '90d'] as const;

export type AdminDashboardPeriod =
  (typeof ADMIN_DASHBOARD_PERIOD_OPTIONS)[number];

export interface AdminDashboardKpiMetric {
  key: 'orders' | 'revenue' | 'customers' | 'store-visits';
  label: string;
  value: string;
  changeLabel: string;
}

export interface AdminDashboardRevenuePoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface AdminDashboardVisitsSegment {
  label: string;
  value: number;
  trendLabel: string;
}

export interface AdminDashboardTopProduct {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  unitsSold: number;
  revenue: number;
}

export interface AdminDashboardStatusBreakdownItem {
  status: OrderStatus;
  label: string;
  value: number;
}

export interface AdminDashboardCustomerMixItem {
  key: 'new' | 'returning' | 'reactivated';
  label: string;
  value: number;
  colorToken:
    | '--chart-1'
    | '--chart-2'
    | '--chart-3'
    | '--chart-4'
    | '--chart-5';
}

export interface AdminDashboardSummary {
  period: AdminDashboardPeriod;
  kpis: AdminDashboardKpiMetric[];
  revenueTrend: AdminDashboardRevenuePoint[];
  visitsTotal: number;
  visitsSegments: AdminDashboardVisitsSegment[];
  topProducts: AdminDashboardTopProduct[];
  statusBreakdown: AdminDashboardStatusBreakdownItem[];
  customerMix: AdminDashboardCustomerMixItem[];
}
