import type { AdminDashboardPeriod } from '@/features/admin/types/admin-dashboard.types';

export const ADMIN_DASHBOARD_QUERY_KEYS = {
  all: ['admin-dashboard'] as const,
  summary: (period: AdminDashboardPeriod) => {
    return [...ADMIN_DASHBOARD_QUERY_KEYS.all, 'summary', period] as const;
  },
};
