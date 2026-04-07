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

export type AdminProductStatusFilter = AdminProductStatus | 'all';

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

export type AdminProductListResponse = AdminProductListApiResponse;
