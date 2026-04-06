import { useQuery } from '@tanstack/react-query';

import { profileApi } from '@/api/profile.api';
import { PROFILE_QUERY_KEYS } from '@/features/profile/hooks/profile.query-keys';
import type { OrdersFilterValue } from '@/features/profile/types';

export const useOrdersQuery = (status: OrdersFilterValue) => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.orders(status),
    queryFn: () => profileApi.getOrders(status),
    staleTime: 30_000,
  });
};
