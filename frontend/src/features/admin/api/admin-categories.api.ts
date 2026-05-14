import type { AdminCategory } from '@/features/admin/types';
import type {
  AdminCategoryApiItem,
  AdminCategoryListApiData,
  AdminCategoryListQueryState,
  AdminCategoryListResponse,
  UpsertAdminCategoryInput,
} from '@/features/admin/types/admin-categories.types';
import {
  categorySortToApiParams,
  mapApiCategoryToAdminCategory,
  mapPaginationMeta,
  mapUpsertCategoryInputToPayload,
  toQueryString,
} from '@/features/admin/mappers';
import {
  authFetch,
  authFetchWithMeta,
} from '@/shared/api/http-client';
import type { AdminPaginationApiMeta } from '@/features/admin/types/admin-products.types';

export const adminCategoriesApi = {
  getCategories: async (
    queryState: AdminCategoryListQueryState
  ): Promise<AdminCategoryListResponse> => {
    const sort = categorySortToApiParams(queryState.sort);
    const query = toQueryString({
      search: queryState.search,
      status: queryState.status === 'all' ? undefined : queryState.status,
      page: queryState.page,
      limit: queryState.pageSize,
      sort: sort.sort,
    });
    const response = await authFetchWithMeta<
      AdminCategoryListApiData,
      AdminPaginationApiMeta
    >(`/categories/management?${query}`);

    return {
      items: response.data.items.map(mapApiCategoryToAdminCategory),
      meta: mapPaginationMeta(
        response.meta,
        queryState.page,
        queryState.pageSize
      ),
      summary: response.data.summary,
    };
  },

  createCategory: async (
    input: UpsertAdminCategoryInput
  ): Promise<AdminCategory> => {
    const category = await authFetch<AdminCategoryApiItem>('/categories', {
      method: 'POST',
      body: JSON.stringify(mapUpsertCategoryInputToPayload(input)),
    });

    return mapApiCategoryToAdminCategory(category);
  },

  updateCategory: async (
    input: UpsertAdminCategoryInput
  ): Promise<AdminCategory> => {
    if (!input.id) {
      throw new Error('Category id is required for update.');
    }

    const category = await authFetch<AdminCategoryApiItem>(
      `/categories/${input.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(mapUpsertCategoryInputToPayload(input)),
      }
    );

    return mapApiCategoryToAdminCategory(category);
  },

  softDeleteCategory: async (categoryId: string): Promise<AdminCategory> => {
    const category = await authFetch<AdminCategoryApiItem>(
      `/categories/${categoryId}`,
      {
        method: 'DELETE',
      }
    );

    return mapApiCategoryToAdminCategory(category);
  },

  restoreCategory: async (categoryId: string): Promise<AdminCategory> => {
    const category = await authFetch<AdminCategoryApiItem>(
      `/categories/${categoryId}/restore`,
      {
        method: 'PATCH',
      }
    );

    return mapApiCategoryToAdminCategory(category);
  },
};
