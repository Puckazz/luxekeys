import type { AdminPaginationApiMeta } from '@/features/admin/types/admin-products.types';
import type {
  AdminInventoryApiData,
  AdminInventoryBulkUpdateInput,
  AdminInventoryBulkUpdateResponse,
  AdminInventoryListApiResponse,
  AdminInventoryListQueryState,
} from '@/features/admin/types/admin-inventory.types';
import {
  inventorySortToApiParams,
  inventoryStatusToApiStatus,
  mapApiInventoryStatusSummary,
  mapInventoryItem,
  mapPaginationMeta,
  productCategoryToApiType,
  toQueryString,
} from '@/features/admin/mappers';
import { authFetch, authFetchWithMeta } from '@/shared/api/http-client';

export const adminInventoryApi = {
  getInventory: async (
    queryState: AdminInventoryListQueryState
  ): Promise<AdminInventoryListApiResponse> => {
    const sort = inventorySortToApiParams(queryState.sort);
    const query = toQueryString({
      search: queryState.search,
      type:
        queryState.category === 'all'
          ? undefined
          : productCategoryToApiType(queryState.category),
      status: inventoryStatusToApiStatus(queryState.status),
      page: queryState.page,
      limit: queryState.pageSize,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    });
    const response = await authFetchWithMeta<
      AdminInventoryApiData,
      AdminPaginationApiMeta
    >(`/products/admin/inventory?${query}`);

    return {
      items: response.data.items.map(mapInventoryItem),
      meta: mapPaginationMeta(
        response.meta,
        queryState.page,
        queryState.pageSize
      ),
      summary: response.data.summary,
      statusSummary: mapApiInventoryStatusSummary(response.data.statusSummary),
    };
  },

  bulkUpdateInventoryStock: async (
    input: AdminInventoryBulkUpdateInput
  ): Promise<AdminInventoryBulkUpdateResponse> => {
    return authFetch<AdminInventoryBulkUpdateResponse>(
      '/products/admin/inventory/stock',
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    );
  },
};
