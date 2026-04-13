import { useQuery } from '@tanstack/react-query';

import { adminCategoriesApi } from '@/api/admin-categories.api';
import { ADMIN_CATEGORIES_QUERY_KEYS } from '@/features/admin/hooks/categories.key';
import type { AdminCategoryListQueryState } from '@/features/admin/types/admin-categories.types';

export const useAdminCategoriesQuery = (
  queryState: AdminCategoryListQueryState
) => {
  return useQuery({
    queryKey: ADMIN_CATEGORIES_QUERY_KEYS.list(queryState),
    queryFn: () => adminCategoriesApi.getCategories(queryState),
    staleTime: 15_000,
  });
};
