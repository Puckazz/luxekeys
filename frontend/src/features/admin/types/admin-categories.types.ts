import type {
  AdminCategoryListApiResponse,
  AdminCategoryStatus,
} from '@/features/admin/types';

export const ADMIN_CATEGORY_SORT_OPTIONS = [
  'newest',
  'name-asc',
  'products-desc',
] as const;

export type AdminCategorySortOption =
  (typeof ADMIN_CATEGORY_SORT_OPTIONS)[number];

export type AdminCategoryStatusFilter = AdminCategoryStatus | 'all';

export interface AdminCategoryListQueryState {
  search: string;
  status: AdminCategoryStatusFilter;
  sort: AdminCategorySortOption;
  page: number;
  pageSize: number;
}

export interface AdminCategoryFormValues {
  name: string;
  description: string;
  status: Exclude<AdminCategoryStatus, 'archived'>;
}

export interface UpsertAdminCategoryInput {
  id?: string;
  name: string;
  description: string;
  status: Exclude<AdminCategoryStatus, 'archived'>;
}

export type AdminCategoryListResponse = AdminCategoryListApiResponse;
