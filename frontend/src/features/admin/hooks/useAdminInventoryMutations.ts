import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminProductsApi } from '@/api/admin-products.api';
import { ADMIN_PRODUCTS_QUERY_KEYS } from '@/features/admin/hooks/admin-products.query-keys';
import type { AdminInventoryBulkUpdateInput } from '@/features/admin/types/admin-inventory.types';

export const useBulkUpdateInventoryStockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminInventoryBulkUpdateInput) => {
      return adminProductsApi.bulkUpdateInventoryStock(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all,
      });
    },
  });
};
