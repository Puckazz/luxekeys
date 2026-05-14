import type {
  AdminProduct,
  AdminProductListApiResponse,
  AdminProductStatus,
  AdminVariantStatus,
} from '@/features/admin/types';
import type { ProductLayout } from '@/features/shop/types';

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
  category: string;
  status: AdminProductStatusFilter;
  sort: AdminProductSortOption;
  page: number;
  pageSize: number;
}

export interface AdminProductVariantFormValue {
  id?: string;
  thumbnailImageId?: string;
  color: string;
  layout: ProductLayout | '';
  switchType: string;
  sku: string;
  originalPrice: number | '';
  price: number;
  stock: number;
  isDefault: boolean;
  status: AdminVariantStatus;
  switchOptions: AdminProductSwitchOptionFormValue[];
}

export interface AdminProductSwitchOptionFormValue {
  id?: string;
  name: string;
  switchType: string;
  originalPrice: number | '';
  price: number;
  stock: number;
  isDefault: boolean;
  status: AdminVariantStatus;
}

export interface AdminProductFormValues {
  name: string;
  shortDescription: string;
  productType: AdminProduct['productType'];
  brandId: string;
  catalogCategoryId: string;
  description: string;
  thumbnail: string;
  tags: string;
  isFeatured: boolean;
  status: Exclude<AdminProductStatus, 'archived'>;
  specs: AdminProductSpecFormValue[];
  variants: AdminProductVariantFormValue[];
}

export interface UpsertAdminProductInput {
  id?: string;
  imageFiles?: File[];
  name: string;
  shortDescription?: string;
  productType: AdminProduct['productType'];
  brandId?: string;
  catalogCategoryId?: string;
  description: string;
  thumbnail: string;
  tags: string[];
  isFeatured: boolean;
  status: Exclude<AdminProductStatus, 'archived'>;
  specs: AdminProductSpecUpsertInput[];
  variants: AdminProductVariantUpsertInput[];
}

export interface AdminProductSpecFormValue {
  id?: string;
  groupName: string;
  specKey: string;
  specValue: string;
}

export interface AdminProductSpecUpsertInput {
  id?: string;
  groupName?: string;
  specKey: string;
  specValue: string;
}

export interface AdminProductSwitchOptionUpsertInput {
  id?: string;
  name: string;
  switchType: string;
  originalPrice: number | null;
  price: number;
  stock: number;
  isDefault: boolean;
  status: AdminVariantStatus;
}

export interface AdminProductVariantUpsertInput {
  id?: string;
  thumbnailImageId?: string;
  color: string;
  layout?: string;
  switchType: string;
  sku: string;
  originalPrice: number | null;
  price: number;
  stock: number;
  isDefault: boolean;
  status: AdminVariantStatus;
  switchOptions: AdminProductSwitchOptionUpsertInput[];
}

export interface AdminProductListResponse extends AdminProductListApiResponse {
  summary: AdminProductStatusSummary;
}

export type AdminProductApiType =
  | 'KEYBOARD'
  | 'SWITCH'
  | 'KEYCAP'
  | 'ACCESSORY'
  | 'BAREBONES_KIT';

export type AdminProductApiStatus = 'ACTIVE' | 'INACTIVE';

export type AdminProductApiStatusFilter =
  | AdminProductApiStatus
  | 'ARCHIVED'
  | 'OUT_OF_STOCK';

export type AdminProductApiSummary = Record<
  'all' | AdminProductApiStatus | 'ARCHIVED' | 'OUT_OF_STOCK',
  number
>;

export type AdminProductSwitchOptionApiItem = {
  id: string;
  switchType: string;
  name: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  stock: number;
  isActive: boolean;
  isDefault: boolean;
  sortOrder?: number;
};

export type AdminProductImageApiItem = {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  cloudinaryPublicId?: string | null;
};

export type AdminProductVariantApiItem = {
  id: string;
  thumbnailImage?: {
    id: string;
    imageUrl: string;
  } | null;
  sku: string;
  name: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  color?: string | null;
  layout?: string | null;
  stock: number;
  isDefault: boolean;
  isActive: boolean;
  switchOptions?: AdminProductSwitchOptionApiItem[];
};

export type AdminProductApiItem = {
  id: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  type: AdminProductApiType;
  status: AdminProductApiStatus;
  thumbnailUrl?: string | null;
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images?: AdminProductImageApiItem[];
  specs?: Array<{
    id: string;
    specKey: string;
    specValue: string;
    groupName?: string | null;
    sortOrder?: number;
  }>;
  variants: AdminProductVariantApiItem[];
};

export type AdminProductBrandOption = {
  id: string;
  name: string;
  slug: string;
};

export type AdminProductCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type AdminProductListApiData = {
  items: AdminProductApiItem[];
  summary: AdminProductApiSummary;
};

export type AdminPaginationApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
