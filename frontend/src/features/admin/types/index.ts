import type { ProductLayout } from '@/features/shop/types';

export const ADMIN_PRODUCT_CATEGORIES = [
  'keyboards',
  'switches',
  'keycaps',
  'accessories',
  'barebones-kits',
] as const;

export type AdminProductCategory = (typeof ADMIN_PRODUCT_CATEGORIES)[number];

export const ADMIN_PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const;

export type AdminProductStatus = (typeof ADMIN_PRODUCT_STATUSES)[number];

export const ADMIN_CATEGORY_STATUSES = ['active', 'draft', 'archived'] as const;

export type AdminCategoryStatus = (typeof ADMIN_CATEGORY_STATUSES)[number];

export const ADMIN_BRAND_STATUSES = ['active', 'draft', 'archived'] as const;

export type AdminBrandStatus = (typeof ADMIN_BRAND_STATUSES)[number];

export const ADMIN_VARIANT_STATUSES = ['active', 'draft'] as const;

export type AdminVariantStatus = (typeof ADMIN_VARIANT_STATUSES)[number];

export interface AdminProductSwitchOption {
  id: string;
  name: string;
  switchType: string;
  originalPrice: number | null;
  price: number;
  stock: number;
  isDefault: boolean;
  status: AdminVariantStatus;
}

export interface AdminProductSpec {
  id: string;
  specKey: string;
  specValue: string;
  groupName: string;
}

export interface AdminProductImage {
  id: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  cloudinaryPublicId?: string | null;
}

export interface AdminProductVariant {
  id: string;
  thumbnailImageId?: string;
  color: string;
  layout: ProductLayout | '';
  switchType: string;
  sku: string;
  originalPrice: number | null;
  price: number;
  stock: number;
  isDefault: boolean;
  status: AdminVariantStatus;
  switchOptions: AdminProductSwitchOption[];
}

export interface AdminProduct {
  id: string;
  name: string;
  shortDescription?: string;
  productType: AdminProductCategory;
  brandId?: string;
  brandName?: string;
  catalogCategoryId?: string;
  catalogCategoryName?: string;
  description: string;
  thumbnail: string;
  tags: string[];
  isFeatured: boolean;
  status: AdminProductStatus;
  createdAt: string;
  updatedAt: string;
  images: AdminProductImage[];
  specs: AdminProductSpec[];
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

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  status: AdminCategoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  productCount: number;
  status: AdminBrandStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoryPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminCategoryListApiResponse {
  items: AdminCategory[];
  meta: AdminCategoryPaginationMeta;
}

export interface AdminBrandPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminBrandListApiResponse {
  items: AdminBrand[];
  meta: AdminBrandPaginationMeta;
}

export type {
  AdminDashboardAverageOrderValueMetric,
  AdminDashboardCustomerMixItem,
  AdminDashboardKpiMetric,
  AdminDashboardPeriod,
  AdminDashboardRevenuePoint,
  AdminDashboardStatusBreakdownItem,
  AdminDashboardSummary,
  AdminDashboardTopProduct,
} from '@/features/admin/types/admin-dashboard.types';

export type {
  AdminUserFormValues,
  AdminUser,
  AdminUserListApiResponse,
  AdminUserListQueryState,
  AdminUserPaginationMeta,
  AdminUserSortOption,
  AdminUserStatusSummary,
  AdminUserStatus,
  ArchiveAdminUserInput,
  RestoreAdminUserInput,
  UpsertAdminUserInput,
  UpdateAdminUserRoleInput,
} from '@/features/admin/types/admin-users.types';

export type {
  AdminOrder,
  AdminOrderCustomer,
  AdminOrderDetail,
  AdminOrderLineItem,
  AdminOrderListApiResponse,
  AdminOrderListQueryState,
  AdminOrderPaginationMeta,
  AdminOrderPaymentStatus,
  AdminOrderShippingAddressSummary,
  AdminOrderSortOption,
  AdminOrderStatusFilter,
  AdminOrderStatusSummary,
  BulkUpdateAdminOrderStatusInput,
  BulkUpdateAdminOrderStatusResponse,
  UpdateAdminOrderInput,
  UpdateAdminOrderStatusInput,
} from '@/features/admin/types/admin-orders.types';

export type {
  AdminReview,
  AdminReviewDetail,
  AdminReviewListApiResponse,
  AdminReviewListQueryState,
  AdminReviewPaginationMeta,
  AdminReviewSortOption,
  AdminReviewStatus,
  AdminReviewStatusFilter,
  AdminReviewStatusSummary,
  BulkUpdateAdminReviewStatusInput,
  BulkUpdateAdminReviewStatusResponse,
  UpdateAdminReviewStatusInput,
} from '@/features/admin/types/admin-reviews.types';
