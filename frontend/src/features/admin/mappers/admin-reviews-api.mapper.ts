import type {
  AdminReview,
  AdminReviewApiItem,
  AdminReviewApiStatus,
  AdminReviewListApiData,
  AdminReviewListApiResponse,
  AdminReviewListQueryState,
  AdminReviewStatus,
  AdminReviewStatusFilter,
} from '@/features/admin/types/admin-reviews.types';

const ADMIN_REVIEW_FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80';

const statusToApiStatus: Record<AdminReviewStatus, AdminReviewApiStatus> = {
  pending: 'PENDING',
  published: 'PUBLISHED',
  hidden: 'HIDDEN',
  rejected: 'REJECTED',
};

const apiStatusToStatus: Record<AdminReviewApiStatus, AdminReviewStatus> = {
  PENDING: 'pending',
  PUBLISHED: 'published',
  HIDDEN: 'hidden',
  REJECTED: 'rejected',
};

export const reviewStatusToApiStatus = (
  status: AdminReviewStatus
): AdminReviewApiStatus => {
  return statusToApiStatus[status];
};

export const reviewStatusFilterToApiStatus = (
  status: AdminReviewStatusFilter
): AdminReviewApiStatus | undefined => {
  if (status === 'all') {
    return undefined;
  }

  return reviewStatusToApiStatus(status);
};

export const reviewSortToApiParams = (
  sort: AdminReviewListQueryState['sort']
): { sortBy: string; sortOrder: 'asc' | 'desc' } => {
  if (sort === 'oldest') {
    return { sortBy: 'createdAt', sortOrder: 'asc' };
  }

  if (sort === 'rating-desc') {
    return { sortBy: 'rating', sortOrder: 'desc' };
  }

  if (sort === 'rating-asc') {
    return { sortBy: 'rating', sortOrder: 'asc' };
  }

  return { sortBy: 'createdAt', sortOrder: 'desc' };
};

export const mapApiReviewToAdminReview = (
  review: AdminReviewApiItem
): AdminReview => {
  return {
    id: review.id,
    productId: review.productId,
    productName: review.productName,
    productImage: review.productImage ?? ADMIN_REVIEW_FALLBACK_THUMBNAIL,
    reviewerName: review.reviewerName,
    reviewerEmail: review.reviewerEmail,
    title: review.title ?? 'Untitled review',
    content: review.content ?? 'No written review.',
    rating: review.rating,
    status: apiStatusToStatus[review.status],
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
};

export const mapApiReviewSummary = (
  summary: AdminReviewListApiData['summary']
): AdminReviewListApiResponse['summary'] => {
  return {
    all: summary.all,
    pending: summary.PENDING,
    published: summary.PUBLISHED,
    hidden: summary.HIDDEN,
    rejected: summary.REJECTED,
  };
};
