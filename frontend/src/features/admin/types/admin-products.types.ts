import type {
  AdminProduct,
  AdminProductCategory,
  AdminProductListApiResponse,
  AdminProductStatus,
  AdminProductVariant,
  AdminVariantStatus,
} from '@/features/admin/types';

export const ADMIN_PRODUCT_SORT_OPTIONS = [
  'newest',
  'name-asc',
  'stock-desc',
  'price-asc',
  'price-desc',
] as const;

export type AdminProductSortOption =
  (typeof ADMIN_PRODUCT_SORT_OPTIONS)[number];

export type AdminComputedProductStatus = AdminProductStatus | 'out-of-stock';

export const ADMIN_PRODUCT_STATUS_FILTER_OPTIONS = [
  'active',
  'draft',
  'archived',
  'out-of-stock',
] as const;

export type AdminProductStatusFilter =
  | (typeof ADMIN_PRODUCT_STATUS_FILTER_OPTIONS)[number]
  | 'all';

export type AdminProductStatusSummary = Record<
  AdminProductStatusFilter,
  number
>;

export interface AdminProductListQueryState {
  search: string;
  category: AdminProductCategory | 'all';
  status: AdminProductStatusFilter;
  sort: AdminProductSortOption;
  page: number;
  pageSize: number;
}

export interface AdminProductVariantFormValue {
  id?: string;
  color: string;
  switchType: string;
  sku: string;
  originalPrice: number;
  price: number;
  stock: number;
  status: AdminVariantStatus;
}

export interface AdminProductFormValues {
  name: string;
  category: AdminProduct['category'];
  description: string;
  thumbnail: string;
  status: Exclude<AdminProductStatus, 'archived'>;
  variants: AdminProductVariantFormValue[];
}

export interface UpsertAdminProductInput {
  id?: string;
  name: string;
  category: AdminProduct['category'];
  description: string;
  thumbnail: string;
  status: Exclude<AdminProductStatus, 'archived'>;
  variants: Array<
    Omit<AdminProductVariant, 'id'> & {
      id?: string;
    }
  >;
}

export interface AdminProductListResponse extends AdminProductListApiResponse {
  summary: AdminProductStatusSummary;
}
