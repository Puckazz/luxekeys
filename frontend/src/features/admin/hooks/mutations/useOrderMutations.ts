import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminOrdersApi } from '@/features/admin/api/admin-orders.api';
import { ADMIN_ORDERS_QUERY_KEYS } from '@/features/admin/hooks/orders.key';
import type {
  BulkUpdateAdminOrderStatusInput,
  UpdateAdminOrderInput,
  UpdateAdminOrderStatusInput,
} from '@/features/admin/types/admin-orders.types';

export const useUpdateAdminOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminOrderInput) => {
      return adminOrdersApi.updateOrder(input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_ORDERS_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_ORDERS_QUERY_KEYS.detail(variables.orderId),
      });
    },
  });
};

export const useUpdateAdminOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminOrderStatusInput) => {
      return adminOrdersApi.updateOrderStatus(input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_ORDERS_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_ORDERS_QUERY_KEYS.detail(variables.orderId),
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
