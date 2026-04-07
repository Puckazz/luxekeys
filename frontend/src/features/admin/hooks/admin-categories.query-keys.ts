import type { AdminCategoryListQueryState } from '@/features/admin/types/admin-categories.types';

export const ADMIN_CATEGORIES_QUERY_KEYS = {
  all: ['admin-categories'] as const,
  list: (queryState: AdminCategoryListQueryState) => {
    return [
      ...ADMIN_CATEGORIES_QUERY_KEYS.all,
      'list',
      queryState.search,
      queryState.status,
      queryState.sort,
      queryState.page,
      queryState.pageSize,
    ] as const;
  },
};
