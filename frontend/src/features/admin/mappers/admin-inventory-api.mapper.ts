import { mapApiProductToAdminProduct } from '@/features/admin/mappers/admin-products-api.mapper';
import type {
  AdminInventoryApiItem,
  AdminInventoryApiStatusFilter,
  AdminInventoryApiStatusSummary,
  AdminInventoryItem,
  AdminInventoryListApiResponse,
  AdminInventoryListQueryState,
  AdminInventoryStatusFilter,
  AdminInventoryStockStatus,
} from '@/features/admin/types/admin-inventory.types';

const apiInventoryStatusToStatus: Record<
  AdminInventoryApiStatusFilter,
  AdminInventoryStockStatus
> = {
  IN_STOCK: 'in-stock',
  LOW_STOCK: 'low-stock',
  OUT_OF_STOCK: 'out-of-stock',
};

export const inventoryStatusToApiStatus = (
  status: AdminInventoryStatusFilter
): AdminInventoryApiStatusFilter | undefined => {
  if (status === 'all') {
    return undefined;
  }

  if (status === 'in-stock') {
    return 'IN_STOCK';
  }

  if (status === 'low-stock') {
    return 'LOW_STOCK';
  }

  return 'OUT_OF_STOCK';
};

export const inventorySortToApiParams = (
  sort: AdminInventoryListQueryState['sort']
): { sortBy: string; sortOrder: 'asc' | 'desc' } => {
  if (sort === 'name-asc') {
    return { sortBy: 'name', sortOrder: 'asc' };
  }

  if (sort === 'stock-asc') {
    return { sortBy: 'stock', sortOrder: 'asc' };
  }

  if (sort === 'stock-desc') {
    return { sortBy: 'stock', sortOrder: 'desc' };
  }

  return { sortBy: 'updatedAt', sortOrder: 'desc' };
};

export const mapApiInventoryStatusSummary = (
  summary: AdminInventoryApiStatusSummary
): AdminInventoryListApiResponse['statusSummary'] => {
  return {
    all: summary.all,
    'in-stock': summary.IN_STOCK,
    'low-stock': summary.LOW_STOCK,
    'out-of-stock': summary.OUT_OF_STOCK,
  };
};

export const mapInventoryItem = (item: AdminInventoryApiItem): AdminInventoryItem => {
  return {
    product: mapApiProductToAdminProduct(item.product),
    variantId: item.variantId,
    variantSku: item.variantSku,
    variantColor: item.variantColor,
    variantSwitchType: item.variantSwitchType,
    variantStock: item.variantStock,
    totalStock: item.totalStock,
    stockStatus: apiInventoryStatusToStatus[item.stockStatus],
  };
};
