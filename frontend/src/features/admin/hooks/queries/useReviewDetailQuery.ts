import { useQuery } from '@tanstack/react-query';

import { adminReviewsApi } from '@/api/admin-reviews.api';
import { ADMIN_REVIEWS_QUERY_KEYS } from '@/features/admin/hooks/reviews.key';

export const useAdminReviewDetailQuery = (
  reviewId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ADMIN_REVIEWS_QUERY_KEYS.detail(reviewId ?? ''),
    queryFn: () => adminReviewsApi.getReviewDetail(reviewId as string),
    staleTime: 15_000,
    enabled: enabled && Boolean(reviewId),
  });
};
