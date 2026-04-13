export const ADMIN_PRODUCT_CATEGORIES = [
  'keyboards',
  'switches',
  'keycaps',
  'accessories',
] as const;

export type AdminProductCategory = (typeof ADMIN_PRODUCT_CATEGORIES)[number];

export const ADMIN_PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const;

export type AdminProductStatus = (typeof ADMIN_PRODUCT_STATUSES)[number];

export const ADMIN_CATEGORY_STATUSES = ['active', 'draft', 'archived'] as const;

export type AdminCategoryStatus = (typeof ADMIN_CATEGORY_STATUSES)[number];

export const ADMIN_VARIANT_STATUSES = ['active', 'draft'] as const;

export type AdminVariantStatus = (typeof ADMIN_VARIANT_STATUSES)[number];

export interface AdminProductVariant {
  id: string;
  color: string;
  switchType: string;
  sku: string;
  originalPrice: number;
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

export type {
  AdminDashboardCustomerMixItem,
  AdminDashboardKpiMetric,
  AdminDashboardPeriod,
  AdminDashboardRevenuePoint,
  AdminDashboardStatusBreakdownItem,
  AdminDashboardSummary,
  AdminDashboardTopProduct,
  AdminDashboardVisitsSegment,
} from '@/features/admin/types/admin-dashboard.types';

export type {
  AdminUserFormValues,
  AdminUser,
  AdminUserListApiResponse,
  AdminUserListQueryState,
  AdminUserPaginationMeta,
  AdminUserSortOption,
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
  AdminOrderShippingAddressSummary,
  AdminOrderSortOption,
  AdminOrderStatusFilter,
  AdminOrderStatusSummary,
  BulkUpdateAdminOrderStatusInput,
  BulkUpdateAdminOrderStatusResponse,
  UpdateAdminOrderStatusInput,
} from '@/features/admin/types/admin-orders.types';
