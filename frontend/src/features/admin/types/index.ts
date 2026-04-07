export const ADMIN_PRODUCT_CATEGORIES = [
  'keyboards',
  'switches',
  'keycaps',
  'accessories',
] as const;

export type AdminProductCategory = (typeof ADMIN_PRODUCT_CATEGORIES)[number];

export const ADMIN_PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const;

export type AdminProductStatus = (typeof ADMIN_PRODUCT_STATUSES)[number];

export const ADMIN_VARIANT_STATUSES = ['active', 'draft'] as const;

export type AdminVariantStatus = (typeof ADMIN_VARIANT_STATUSES)[number];

export interface AdminProductVariant {
  id: string;
  color: string;
  switchType: string;
  sku: string;
  price: number;
  stock: number;
  status: AdminVariantStatus;
}

export interface AdminProduct {
  id: string;
  name: string;
  category: AdminProductCategory;
  description: string;
  thumbnail: string;
  status: AdminProductStatus;
  createdAt: string;
  updatedAt: string;
  variants: AdminProductVariant[];
}

export interface AdminProductPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminProductListApiResponse {
  items: AdminProduct[];
  meta: AdminProductPaginationMeta;
}
