import { useQuery } from '@tanstack/react-query';

import { profileApi } from '@/api/profile.api';
import { PROFILE_QUERY_KEYS } from '@/features/profile/hooks/profile.query-keys';

export const useOrderDetailQuery = (orderId: string | null) => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.orderDetail(orderId ?? 'none'),
    queryFn: () => profileApi.getOrderDetail(orderId ?? ''),
    enabled: Boolean(orderId),
    staleTime: 30_000,
  });
};
