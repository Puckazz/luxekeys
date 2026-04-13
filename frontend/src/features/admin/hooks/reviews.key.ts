import type { AdminReviewListQueryState } from '@/features/admin/types/admin-reviews.types';

export const ADMIN_REVIEWS_QUERY_KEYS = {
  all: ['admin-reviews'] as const,
  list: (queryState: AdminReviewListQueryState) => {
    return [
      ...ADMIN_REVIEWS_QUERY_KEYS.all,
      'list',
      queryState.search,
      queryState.status,
      queryState.sort,
      queryState.page,
      queryState.pageSize,
    ] as const;
  },
  detail: (reviewId: string) => {
    return [...ADMIN_REVIEWS_QUERY_KEYS.all, 'detail', reviewId] as const;
  },
};
