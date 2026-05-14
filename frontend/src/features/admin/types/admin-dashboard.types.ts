import type { OrderStatus } from '@/features/profile/types';

export const ADMIN_DASHBOARD_PERIOD_OPTIONS = ['7d', '30d', '90d'] as const;

export type AdminDashboardPeriod =
  (typeof ADMIN_DASHBOARD_PERIOD_OPTIONS)[number];

export interface AdminDashboardKpiMetric {
  key: 'orders' | 'revenue' | 'customers' | 'average-order-value';
  label: string;
  value: string;
  changeLabel: string;
  rawValue: number;
  previousRawValue: number;
  changePercent: number;
}

export interface AdminDashboardRevenuePoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface AdminDashboardAverageOrderValueMetric {
  label: string;
  value: string;
  previousValue: string;
  changeLabel: string;
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
  averageOrderValue: AdminDashboardAverageOrderValueMetric;
  topProducts: AdminDashboardTopProduct[];
  statusBreakdown: AdminDashboardStatusBreakdownItem[];
  customerMix: AdminDashboardCustomerMixItem[];
}
