import { useQuery } from '@tanstack/react-query';

import { adminHealthApi } from '@/features/admin/api/admin-health.api';
import { ADMIN_HEALTH_QUERY_KEYS } from '@/features/admin/hooks/health.key';

export const useAdminHealthQuery = () => {
  return useQuery({
    queryKey: ADMIN_HEALTH_QUERY_KEYS.status(),
    queryFn: adminHealthApi.getHealth,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });
};
