import { useQuery } from '@tanstack/react-query';

import { adminProductsApi } from '@/api/admin-products.api';
import { ADMIN_PRODUCTS_QUERY_KEYS } from '@/features/admin/hooks/admin-products.query-keys';
import type { AdminProductListQueryState } from '@/features/admin/types/admin-products.types';

export const useAdminProductsQuery = (
  queryState: AdminProductListQueryState
) => {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_QUERY_KEYS.list(queryState),
    queryFn: () => adminProductsApi.getProducts(queryState),
    staleTime: 15_000,
  });
};
