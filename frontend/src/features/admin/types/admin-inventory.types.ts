import type {
  AdminProduct,
  AdminProductPaginationMeta,
} from '@/features/admin/types';
import type { AdminProductApiItem } from '@/features/admin/types/admin-products.types';

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

export type AdminInventoryStatusSummary = Record<
  AdminInventoryStatusFilter,
  number
>;

export interface AdminInventoryListQueryState {
  search: string;
  category: string;
  status: AdminInventoryStatusFilter;
  sort: AdminInventorySortOption;
  page: number;
  pageSize: number;
}

export interface AdminInventoryItem {
  product: AdminProduct;
  variantId: string;
  thumbnail: string;
  variantSku: string;
  variantColor: string;
  variantOptionName: string;
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
  statusSummary: AdminInventoryStatusSummary;
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

export type AdminInventoryApiStatusFilter =
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK';

export type AdminInventoryApiStatusSummary = Record<
  'all' | AdminInventoryApiStatusFilter,
  number
>;

export type AdminInventoryApiItem = {
  product: AdminProductApiItem;
  variantId: string;
  thumbnailUrl: string | null;
  variantSku: string;
  variantColor: string;
  variantOptionName: string;
  variantStock: number;
  totalStock: number;
  stockStatus: AdminInventoryApiStatusFilter;
};

export type AdminInventoryApiData = {
  items: AdminInventoryApiItem[];
  summary: AdminInventoryListSummary;
  statusSummary: AdminInventoryApiStatusSummary;
};
