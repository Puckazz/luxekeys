import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminOrdersApi } from '@/api/admin-orders.api';
import { ADMIN_ORDERS_QUERY_KEYS } from '@/features/admin/hooks/orders.key';
import type {
  BulkUpdateAdminOrderStatusInput,
  UpdateAdminOrderStatusInput,
} from '@/features/admin/types/admin-orders.types';

export const useUpdateAdminOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminOrderStatusInput) => {
      return adminOrdersApi.updateOrderStatus(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_ORDERS_QUERY_KEYS.all,
      });
    },
  });
};

export const useBulkUpdateAdminOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkUpdateAdminOrderStatusInput) => {
      return adminOrdersApi.bulkUpdateOrderStatus(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_ORDERS_QUERY_KEYS.all,
      });
    },
  });
};
