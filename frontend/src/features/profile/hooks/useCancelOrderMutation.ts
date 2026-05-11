import { useMutation, useQueryClient } from '@tanstack/react-query';

import { profileApi } from '@/features/profile/api/profile.api';
import { PROFILE_QUERY_KEYS } from '@/features/profile/hooks/profile.query-keys';

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: profileApi.cancelOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(
        PROFILE_QUERY_KEYS.orderDetail(order.orderId),
        order
      );
      queryClient.invalidateQueries({
        queryKey: ['profile', 'orders'],
      });
    },
  });

  return {
    cancelOrder: mutation.mutateAsync,
    isCancelling: mutation.isPending,
    cancelOrderError: mutation.error,
  };
};
