import { useQuery } from '@tanstack/react-query';

import { adminReviewsApi } from '@/api/admin-reviews.api';
import { ADMIN_REVIEWS_QUERY_KEYS } from '@/features/admin/hooks/reviews.key';
import type { AdminReviewListQueryState } from '@/features/admin/types/admin-reviews.types';

export const useAdminReviewsQuery = (queryState: AdminReviewListQueryState) => {
  return useQuery({
    queryKey: ADMIN_REVIEWS_QUERY_KEYS.list(queryState),
    queryFn: () => adminReviewsApi.getReviews(queryState),
    staleTime: 15_000,
  });
};
