import type {
  AdminProduct,
  AdminProductCategory,
  AdminProductPaginationMeta,
} from '@/features/admin/types';

export const ADMIN_INVENTORY_SORT_OPTIONS = [
  'updated-desc',
  'name-asc',
  'stock-asc',
  'stock-desc',
] as const;

export type AdminInventorySortOption =
  (typeof ADMIN_INVENTORY_SORT_OPTIONS)[number];

export const ADMIN_INVENTORY_STATUS_FILTER_OPTIONS = [
  'in-stock',
  'low-stock',
  'out-of-stock',
] as const;

export type AdminInventoryStockStatus =
  (typeof ADMIN_INVENTORY_STATUS_FILTER_OPTIONS)[number];

export type AdminInventoryStatusFilter = AdminInventoryStockStatus | 'all';

export interface AdminInventoryListQueryState {
  search: string;
  category: AdminProductCategory | 'all';
  status: AdminInventoryStatusFilter;
  sort: AdminInventorySortOption;
  page: number;
  pageSize: number;
}

export interface AdminInventoryItem {
  product: AdminProduct;
  variantId: string;
  variantSku: string;
  variantColor: string;
  variantSwitchType: string;
  variantStock: number;
  totalStock: number;
  stockStatus: AdminInventoryStockStatus;
}

export interface AdminInventoryListSummary {
  totalVariants: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface AdminInventoryListApiResponse {
  items: AdminInventoryItem[];
  meta: AdminProductPaginationMeta;
  summary: AdminInventoryListSummary;
}

export interface AdminInventoryBulkUpdateItemInput {
  productId: string;
  variantId: string;
  stock: number;
}

export interface AdminInventoryBulkUpdateInput {
  updates: AdminInventoryBulkUpdateItemInput[];
}

export interface AdminInventoryBulkUpdateResponse {
  updatedCount: number;
}
