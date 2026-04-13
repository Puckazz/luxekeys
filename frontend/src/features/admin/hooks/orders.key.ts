import type { AdminOrderListQueryState } from '@/features/admin/types/admin-orders.types';

export const ADMIN_ORDERS_QUERY_KEYS = {
  all: ['admin-orders'] as const,
  list: (queryState: AdminOrderListQueryState) => {
    return [
      ...ADMIN_ORDERS_QUERY_KEYS.all,
      'list',
      queryState.search,
      queryState.status,
      queryState.sort,
      queryState.page,
      queryState.pageSize,
    ] as const;
  },
  detail: (orderId: string) => {
    return [...ADMIN_ORDERS_QUERY_KEYS.all, 'detail', orderId] as const;
  },
};
