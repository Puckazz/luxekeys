import { useQuery } from '@tanstack/react-query';

import { adminProductsApi } from '@/api/admin-products.api';
import { ADMIN_PRODUCTS_QUERY_KEYS } from '@/features/admin/hooks/admin-products.query-keys';
import type { AdminInventoryListQueryState } from '@/features/admin/types/admin-inventory.types';

export const useAdminInventoryQuery = (
  queryState: AdminInventoryListQueryState
) => {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_QUERY_KEYS.inventoryList(queryState),
    queryFn: () => adminProductsApi.getInventory(queryState),
    staleTime: 15_000,
  });
};
