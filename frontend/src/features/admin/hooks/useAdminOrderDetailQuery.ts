import { useQuery } from '@tanstack/react-query';

import { adminOrdersApi } from '@/api/admin-orders.api';
import { ADMIN_ORDERS_QUERY_KEYS } from '@/features/admin/hooks/admin-orders.query-keys';

export const useAdminOrderDetailQuery = (
  orderId: string | null,
  open: boolean
) => {
  return useQuery({
    queryKey: ADMIN_ORDERS_QUERY_KEYS.detail(orderId ?? ''),
    queryFn: () => adminOrdersApi.getOrderDetail(orderId ?? ''),
    staleTime: 15_000,
    enabled: Boolean(orderId) && open,
  });
};
