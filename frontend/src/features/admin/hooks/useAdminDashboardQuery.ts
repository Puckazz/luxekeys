import { useQuery } from '@tanstack/react-query';

import { adminDashboardApi } from '@/api/admin-dashboard.api';
import { ADMIN_DASHBOARD_QUERY_KEYS } from '@/features/admin/hooks/admin-dashboard.query-keys';
import type { AdminDashboardPeriod } from '@/features/admin/types/admin-dashboard.types';

export const useAdminDashboardQuery = (period: AdminDashboardPeriod) => {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEYS.summary(period),
    queryFn: () => adminDashboardApi.getDashboardSummary(period),
    staleTime: 30_000,
  });
};
