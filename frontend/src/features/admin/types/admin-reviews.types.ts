import type { AdminProductPaginationMeta } from '@/features/admin/types';

export const ADMIN_REVIEW_SORT_OPTIONS = [
  'newest',
  'oldest',
  'rating-desc',
  'rating-asc',
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

export type AdminReviewApiStatus =
  | 'PENDING'
  | 'PUBLISHED'
  | 'HIDDEN'
  | 'REJECTED';

export interface AdminReviewApiItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  reviewerName: string;
  reviewerEmail: string;
  title?: string | null;
  content?: string | null;
  rating: number;
  status: AdminReviewApiStatus;
  moderationNote?: string | null;
  moderatedAt?: string | null;
  moderatedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReviewListApiData {
  items: AdminReviewApiItem[];
  summary: Record<AdminReviewApiStatus | 'all', number>;
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
