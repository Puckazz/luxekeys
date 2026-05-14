import type { AdminPaginationApiMeta } from '@/features/admin/types/admin-products.types';
import type {
  AdminReview,
  AdminReviewApiItem,
  AdminReviewListApiData,
  AdminReviewListApiResponse,
  AdminReviewListQueryState,
  BulkUpdateAdminReviewStatusInput,
  BulkUpdateAdminReviewStatusResponse,
  UpdateAdminReviewStatusInput,
} from '@/features/admin/types/admin-reviews.types';
import {
  mapApiReviewSummary,
  mapApiReviewToAdminReview,
  mapPaginationMeta,
  reviewSortToApiParams,
  reviewStatusFilterToApiStatus,
  reviewStatusToApiStatus,
  toQueryString,
} from '@/features/admin/mappers';
import { authFetch, authFetchWithMeta } from '@/shared/api/http-client';

export const adminReviewsApi = {
  getReviews: async (
    queryState: AdminReviewListQueryState
  ): Promise<AdminReviewListApiResponse> => {
    const sort = reviewSortToApiParams(queryState.sort);
    const query = toQueryString({
      search: queryState.search,
      status: reviewStatusFilterToApiStatus(queryState.status),
      page: queryState.page,
      limit: queryState.pageSize,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    });
    const response = await authFetchWithMeta<
      AdminReviewListApiData,
      AdminPaginationApiMeta
    >(`/admin/reviews?${query}`);

    return {
      items: response.data.items.map(mapApiReviewToAdminReview),
      meta: mapPaginationMeta(
        response.meta,
        queryState.page,
        queryState.pageSize
      ),
      summary: mapApiReviewSummary(response.data.summary),
    };
  },

  getReviewDetail: async (reviewId: string): Promise<AdminReview> => {
    const review = await authFetch<AdminReviewApiItem>(
      `/admin/reviews/${reviewId}`
    );

    return mapApiReviewToAdminReview(review);
  },

  updateReviewStatus: async (
    input: UpdateAdminReviewStatusInput
  ): Promise<AdminReview> => {
    const review = await authFetch<AdminReviewApiItem>(
      `/admin/reviews/${input.reviewId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: reviewStatusToApiStatus(input.status),
          moderationNote: input.moderationNote,
        }),
      }
    );

    return mapApiReviewToAdminReview(review);
  },

  bulkUpdateReviewStatus: async (
    input: BulkUpdateAdminReviewStatusInput
  ): Promise<BulkUpdateAdminReviewStatusResponse> => {
    return authFetch<BulkUpdateAdminReviewStatusResponse>(
      '/admin/reviews/bulk-status',
      {
        method: 'PATCH',
        body: JSON.stringify({
          reviewIds: input.reviewIds,
          status: reviewStatusToApiStatus(input.status),
          moderationNote: input.moderationNote,
        }),
      }
    );
  },
};
