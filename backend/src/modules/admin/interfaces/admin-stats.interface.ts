import { OrderStatus } from '../../../generated/prisma/index.js';
import type { AdminStatsPeriod } from '../dto/admin-stats-query.dto.js';

export interface AdminStatsKpi {
  key: 'orders' | 'revenue' | 'customers' | 'average-order-value';
  label: string;
  value: number;
  previousValue: number;
  changePercent: number;
}

export interface AdminStatsStatusBreakdownItem {
  status: OrderStatus;
  label: string;
  value: number;
}

export interface AdminStatsCustomerMixItem {
  key: 'new' | 'returning' | 'reactivated';
  label: string;
  value: number;
}

export interface AdminStatsOverview {
  period: AdminStatsPeriod;
  kpis: AdminStatsKpi[];
  statusBreakdown: AdminStatsStatusBreakdownItem[];
  customerMix: AdminStatsCustomerMixItem[];
}

export interface AdminStatsRevenuePoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface AdminStatsRevenue {
  period: AdminStatsPeriod;
  points: AdminStatsRevenuePoint[];
}

export interface AdminStatsTopProduct {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  unitsSold: number;
  revenue: number;
}

export interface AdminStatsTopProducts {
  period: AdminStatsPeriod;
  items: AdminStatsTopProduct[];
}
