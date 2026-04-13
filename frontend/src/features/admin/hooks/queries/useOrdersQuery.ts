import { useQuery } from '@tanstack/react-query';

import { adminOrdersApi } from '@/api/admin-orders.api';
import { ADMIN_ORDERS_QUERY_KEYS } from '@/features/admin/hooks/orders.key';
import type { AdminOrderListQueryState } from '@/features/admin/types/admin-orders.types';

export const useAdminOrdersQuery = (queryState: AdminOrderListQueryState) => {
  return useQuery({
    queryKey: ADMIN_ORDERS_QUERY_KEYS.list(queryState),
    queryFn: () => adminOrdersApi.getOrders(queryState),
    staleTime: 15_000,
  });
};
