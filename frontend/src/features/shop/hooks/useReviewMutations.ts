import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { OrderDetail } from '@/features/profile/types';
import { PROFILE_QUERY_KEYS } from '@/features/profile/hooks/profile.query-keys';
import {
  productsApi,
  type CreateReviewPayload,
  type UpdateReviewPayload,
} from '@/features/shop/api/products.api';

export const useReviewMutations = () => {
  const queryClient = useQueryClient();

  const updateOrderDetailCache = ({
    orderItemId,
    review,
    isReviewed,
  }: {
    orderItemId: string;
    review: OrderDetail['items'][number]['review'];
    isReviewed: boolean;
  }) => {
    queryClient.setQueriesData<OrderDetail | OrderDetail[] | undefined>(
      {
        queryKey: PROFILE_QUERY_KEYS.allOrders,
      },
      (cached) => {
        if (!cached || Array.isArray(cached) || !('items' in cached)) {
          return cached;
        }

        return {
          ...cached,
          items: cached.items.map((item) =>
            item.id === orderItemId
              ? {
                  ...item,
                  isReviewed,
                  review,
                }
              : item
          ),
        };
      }
    );
  };

  const createReviewMutation = useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: CreateReviewPayload;
    }) => productsApi.createReview(productId, payload),
    onSuccess: (reviewResult, { payload }) => {
      queryClient.invalidateQueries({
        queryKey: ['product-reviews'],
      });
      queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEYS.allOrders,
      });
      updateOrderDetailCache({
        orderItemId: payload.orderItemId,
        isReviewed: true,
        review: {
          id: reviewResult.id,
          rating: reviewResult.rating,
          status: 'published',
          title: payload.title ?? null,
          content: payload.content ?? null,
        },
      });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({
      productId,
      reviewId,
      payload,
    }: {
      productId: string;
      reviewId: string;
      orderItemId: string;
      payload: UpdateReviewPayload;
    }) => productsApi.updateReview(productId, reviewId, payload),
    onSuccess: (reviewResult, { reviewId, orderItemId, payload }) => {
      queryClient.invalidateQueries({
        queryKey: ['product-reviews'],
      });
      queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEYS.allOrders,
      });
      updateOrderDetailCache({
        orderItemId,
        isReviewed: true,
        review: {
          id: reviewId,
          rating: reviewResult.rating,
          status: 'published',
          title: payload.title ?? null,
          content: payload.content ?? null,
        },
      });
    },
  });

  return {
    createReview: createReviewMutation.mutate,
    updateReview: updateReviewMutation.mutate,
    isSaving: createReviewMutation.isPending || updateReviewMutation.isPending,
    error: createReviewMutation.error ?? updateReviewMutation.error,
  };
};
