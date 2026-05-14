import type { AdminBrand } from '@/features/admin/types';
import {
  brandSortToApiParams,
  mapApiBrandToAdminBrand,
  mapPaginationMeta,
  mapUpsertBrandInputToPayload,
  toQueryString,
} from '@/features/admin/mappers';
import type {
  AdminBrandApiItem,
  AdminBrandListApiData,
  AdminBrandListQueryState,
  AdminBrandListResponse,
  UpsertAdminBrandInput,
} from '@/features/admin/types/admin-brands.types';
import type { AdminPaginationApiMeta } from '@/features/admin/types/admin-products.types';
import { authFetch, authFetchWithMeta } from '@/shared/api/http-client';

export const adminBrandsApi = {
  getBrands: async (
    queryState: AdminBrandListQueryState
  ): Promise<AdminBrandListResponse> => {
    const sort = brandSortToApiParams(queryState.sort);
    const query = toQueryString({
      search: queryState.search,
      status: queryState.status === 'all' ? undefined : queryState.status,
      page: queryState.page,
      limit: queryState.pageSize,
      sort: sort.sort,
    });
    const response = await authFetchWithMeta<
      AdminBrandListApiData,
      AdminPaginationApiMeta
    >(`/brands/admin?${query}`);

    return {
      items: response.data.items.map(mapApiBrandToAdminBrand),
      meta: mapPaginationMeta(
        response.meta,
        queryState.page,
        queryState.pageSize
      ),
      summary: response.data.summary,
    };
  },

  createBrand: async (input: UpsertAdminBrandInput): Promise<AdminBrand> => {
    const brand = await authFetch<AdminBrandApiItem>('/brands/admin', {
      method: 'POST',
      body: JSON.stringify(mapUpsertBrandInputToPayload(input)),
    });

    return mapApiBrandToAdminBrand(brand);
  },

  updateBrand: async (input: UpsertAdminBrandInput): Promise<AdminBrand> => {
    if (!input.id) {
      throw new Error('Brand id is required for update.');
    }

    const brand = await authFetch<AdminBrandApiItem>(`/brands/admin/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify(mapUpsertBrandInputToPayload(input)),
    });

    return mapApiBrandToAdminBrand(brand);
  },

  softDeleteBrand: async (brandId: string): Promise<AdminBrand> => {
    const brand = await authFetch<AdminBrandApiItem>(`/brands/admin/${brandId}`, {
      method: 'DELETE',
    });

    return mapApiBrandToAdminBrand(brand);
  },

  restoreBrand: async (brandId: string): Promise<AdminBrand> => {
    const brand = await authFetch<AdminBrandApiItem>(
      `/brands/admin/${brandId}/restore`,
      {
        method: 'PATCH',
      }
    );

    return mapApiBrandToAdminBrand(brand);
  },
};
