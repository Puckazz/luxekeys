import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminReviewsApi } from '@/api/admin-reviews.api';
import { ADMIN_REVIEWS_QUERY_KEYS } from '@/features/admin/hooks/reviews.key';
import type {
  BulkUpdateAdminReviewStatusInput,
  UpdateAdminReviewStatusInput,
} from '@/features/admin/types/admin-reviews.types';

const useInvalidateAdminReviewList = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: ADMIN_REVIEWS_QUERY_KEYS.all,
    });
  };
};

export const useUpdateAdminReviewStatusMutation = () => {
  const invalidate = useInvalidateAdminReviewList();

  return useMutation({
    mutationFn: (input: UpdateAdminReviewStatusInput) => {
      return adminReviewsApi.updateReviewStatus(input);
    },
    onSuccess: invalidate,
  });
};

export const useBulkUpdateAdminReviewStatusMutation = () => {
  const invalidate = useInvalidateAdminReviewList();

  return useMutation({
    mutationFn: (input: BulkUpdateAdminReviewStatusInput) => {
      return adminReviewsApi.bulkUpdateReviewStatus(input);
    },
    onSuccess: invalidate,
  });
};
