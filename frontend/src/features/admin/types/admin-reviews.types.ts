import type { AdminProductPaginationMeta } from '@/features/admin/types';

export const ADMIN_REVIEW_SORT_OPTIONS = [
  'newest',
  'oldest',
  'rating-desc',
  'rating-asc',
  'helpful-desc',
] as const;

export type AdminReviewSortOption = (typeof ADMIN_REVIEW_SORT_OPTIONS)[number];

export const ADMIN_REVIEW_STATUSES = [
  'pending',
  'published',
  'hidden',
  'rejected',
] as const;

export type AdminReviewStatus = (typeof ADMIN_REVIEW_STATUSES)[number];

export type AdminReviewStatusFilter = AdminReviewStatus | 'all';

export interface AdminReviewListQueryState {
  search: string;
  status: AdminReviewStatusFilter;
  sort: AdminReviewSortOption;
  page: number;
  pageSize: number;
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  reviewerName: string;
  reviewerEmail: string;
  title: string;
  content: string;
  rating: number;
  helpfulCount: number;
  status: AdminReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export type AdminReviewDetail = AdminReview;

export type AdminReviewPaginationMeta = AdminProductPaginationMeta;

export type AdminReviewStatusSummary = Record<AdminReviewStatusFilter, number>;

export interface AdminReviewListApiResponse {
  items: AdminReview[];
  meta: AdminReviewPaginationMeta;
  summary: AdminReviewStatusSummary;
}

export interface UpdateAdminReviewStatusInput {
  reviewId: string;
  status: AdminReviewStatus;
  moderationNote?: string;
}

export interface BulkUpdateAdminReviewStatusInput {
  reviewIds: string[];
  status: AdminReviewStatus;
  moderationNote?: string;
}

export interface BulkUpdateAdminReviewStatusResponse {
  updatedCount: number;
}
