import type { AdminProductListQueryState } from '@/features/admin/types/admin-products.types';
import type { AdminInventoryListQueryState } from '@/features/admin/types/admin-inventory.types';

export const ADMIN_PRODUCTS_QUERY_KEYS = {
  all: ['admin-products'] as const,
  list: (queryState: AdminProductListQueryState) => {
    return [...ADMIN_PRODUCTS_QUERY_KEYS.all, 'list', queryState] as const;
  },
  inventoryList: (queryState: AdminInventoryListQueryState) => {
    return [
      ...ADMIN_PRODUCTS_QUERY_KEYS.all,
      'inventory-list',
      queryState,
    ] as const;
  },
};
