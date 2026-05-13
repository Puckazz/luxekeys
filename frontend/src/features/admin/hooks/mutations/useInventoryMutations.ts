import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminInventoryApi } from '@/features/admin/api/admin-inventory.api';
import { ADMIN_PRODUCTS_QUERY_KEYS } from '@/features/admin/hooks/products.key';
import type { AdminInventoryBulkUpdateInput } from '@/features/admin/types/admin-inventory.types';

export const useBulkUpdateInventoryStockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminInventoryBulkUpdateInput) => {
      return adminInventoryApi.bulkUpdateInventoryStock(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all,
      });
    },
  });
};
