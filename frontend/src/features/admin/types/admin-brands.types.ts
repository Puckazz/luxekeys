import type {
  AdminBrandListApiResponse,
  AdminBrandStatus,
} from '@/features/admin/types';

export const ADMIN_BRAND_SORT_OPTIONS = [
  'newest',
  'name-asc',
  'products-desc',
] as const;

export type AdminBrandSortOption = (typeof ADMIN_BRAND_SORT_OPTIONS)[number];

export type AdminBrandStatusFilter = AdminBrandStatus | 'all';

export type AdminBrandStatusSummary = Record<AdminBrandStatusFilter, number>;

export interface AdminBrandListQueryState {
  search: string;
  status: AdminBrandStatusFilter;
  sort: AdminBrandSortOption;
  page: number;
  pageSize: number;
}

export interface AdminBrandFormValues {
  name: string;
  logoUrl: string;
  status: Exclude<AdminBrandStatus, 'archived'>;
}

export interface UpsertAdminBrandInput {
  id?: string;
  name: string;
  logoUrl?: string;
  status: Exclude<AdminBrandStatus, 'archived'>;
}

export interface AdminBrandListResponse extends AdminBrandListApiResponse {
  summary: AdminBrandStatusSummary;
}

export type AdminBrandApiItem = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count: {
    products: number;
  };
};

export type AdminBrandListApiData = {
  items: AdminBrandApiItem[];
  summary: AdminBrandStatusSummary;
};

export type AdminBrandApiPayload = {
  name: string;
  logoUrl?: string;
  isActive: boolean;
};
