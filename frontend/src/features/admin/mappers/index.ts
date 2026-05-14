export {
  mapPaginationMeta,
  toQueryString,
} from '@/features/admin/mappers/admin-api.shared';

export {
  mapApiProductToAdminProduct,
  mapApiSummary,
  mapUpsertInputToPayload,
  productCategoryToApiType,
  productSortToApiParams,
  productStatusFilterToApiStatus,
} from '@/features/admin/mappers/admin-products-api.mapper';

export {
  inventorySortToApiParams,
  inventoryStatusToApiStatus,
  mapApiInventoryStatusSummary,
  mapInventoryItem,
} from '@/features/admin/mappers/admin-inventory-api.mapper';

export {
  categorySortToApiParams,
  mapApiCategoryToAdminCategory,
  mapUpsertCategoryInputToPayload,
} from '@/features/admin/mappers/admin-categories-api.mapper';

export {
  brandSortToApiParams,
  mapApiBrandToAdminBrand,
  mapUpsertBrandInputToPayload,
} from '@/features/admin/mappers/admin-brands-api.mapper';
