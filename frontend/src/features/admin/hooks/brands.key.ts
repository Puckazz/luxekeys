import type { AdminBrandListQueryState } from '@/features/admin/types/admin-brands.types';

export const ADMIN_BRANDS_QUERY_KEYS = {
  all: ['admin-brands'] as const,
  list: (queryState: AdminBrandListQueryState) => {
    return [
      ...ADMIN_BRANDS_QUERY_KEYS.all,
      'list',
      queryState.search,
      queryState.status,
      queryState.sort,
      queryState.page,
      queryState.pageSize,
    ] as const;
  },
};
