import { useQuery } from '@tanstack/react-query';

import { adminInventoryApi } from '@/features/admin/api/admin-inventory.api';
import { ADMIN_PRODUCTS_QUERY_KEYS } from '@/features/admin/hooks/products.key';
import type { AdminInventoryListQueryState } from '@/features/admin/types/admin-inventory.types';

export const useAdminInventoryQuery = (
  queryState: AdminInventoryListQueryState
) => {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_QUERY_KEYS.inventoryList(queryState),
    queryFn: () => adminInventoryApi.getInventory(queryState),
    staleTime: 15_000,
  });
};
