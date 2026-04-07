import type { AdminProductListQueryState } from '@/features/admin/types/admin-products.types';

export const ADMIN_PRODUCTS_QUERY_KEYS = {
  all: ['admin-products'] as const,
  list: (queryState: AdminProductListQueryState) => {
    return [
      ...ADMIN_PRODUCTS_QUERY_KEYS.all,
      'list',
      queryState.search,
      queryState.category,
      queryState.status,
      queryState.sort,
      queryState.page,
      queryState.pageSize,
    ] as const;
  },
};
